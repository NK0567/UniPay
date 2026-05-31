const crypto = require('crypto');
const prisma = require('../../../database/prisma');
const transferLinkRepository = require('../repositories/lien.repository');
const currencyHelper = require('../../../helpers/currency.helper');
const cryptoUtil = require('../../../utils/crypto.util');
const authRepository = require('../../auth/repositories/auth.repository');
const logger = require('../../../utils/logger');
const auditEventEmitter = require('../../../events/audit.event');

class TransferLinkService {
  async genererLienSigne(utilisateurId, portefeuilleId) {
    // 1. Génération du 'code' de 10 caractères max pour l'URL (@db.VarChar(10))
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();

    // 2. Génération du 'token' unique sécurisé de 64 caractères (@db.VarChar(128))
    const token = crypto.randomBytes(32).toString('hex');

    // 3. Configuration de la validité stricte de 24 heures
    const dateExpiration = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // 4. Calcul de la signature HMAC-SHA256 en utilisant le token et l'id de l'utilisateur
    const signatureHmac = cryptoUtil.calculerSignatureLien(token, utilisateurId);

    // 5. Envoi sécurisé au repository sous forme d'un objet unique déstructuré
    await transferLinkRepository.creerLien({
      utilisateurId,
      portefeuilleId,
      code,
      token,
      signatureHmac,
      dateExpiration
    });

    // 6. Construction de l'URL finale pour ton application mobile UniPay
    const lienDePartage = `https://unipay-app.com/pay/${code}?token=${token}&sig=${signatureHmac}`;

    return {
      lienDePartage,
      code,
      token,
      signatureHmac,
      expireLe: dateExpiration
    };
  }

  async inspecterLienEtVerifierSignature(code, signatureFournie) {
    // 1. Récupération du lien actif en base de données
    const lien = await transferLinkRepository.trouverLienValide(code);
    if (!lien) {
      throw new Error("Ce lien de paiement est invalide ou a expiré (validité de 24h dépassée).");
    }

    // 2. Vérification cryptographique de la signature HMAC
    const estValide = cryptoUtil.verifierSignatureLien(
      lien.token,
      lien.utilisateurId,
      signatureFournie
    );
    if (!estValide) {
      throw new Error("Alerte de sécurité : Ce lien de paiement a été altéré ou falsifié.");
    }

    // 3. Extraction de la géolocalisation et de la devise via le numéro de l'utilisateur
    const geoDemandeur = currencyHelper.detecterParTelephone(lien.utilisateur.telephone);

    // 4. Renvoi de la carte d'identité du lien pour l'application mobile / web
    return {
      code: lien.code,
      montant: lien.montant, // Inclus au cas où un montant fixe a été défini
      dateExpiration: lien.dateExpiration,
      demandeur: {
        id: lien.utilisateur.id,
        nom: lien.utilisateur.nom,
        prenom: lien.utilisateur.prenom,
        pays: lien.utilisateur.pays || geoDemandeur.pays,
        devise: geoDemandeur.devise,
        avatar: lien.utilisateur.avatar || "https://unipay-cdn.com/default-avatar.png"
      }
    };
  }

  async executerPaiementLienSecurise(utilisateurPayeurId, { codeUnique, signature, montant }, contextRequest = {}) {
    try {
      const montantSaisi = parseFloat(montant);
      if (isNaN(montantSaisi) || montantSaisi <= 0) {
        throw new Error("Le montant du paiement doit être supérieur à 0.");
      }

      // 1. Récupérer le lien actif
      const lien = await transferLinkRepository.trouverLienValide(codeUnique);
      if (!lien) {
        throw new Error("Ce lien de paiement est invalide, inactif ou a expiré (validité de 24h dépassée).");
      }

      // 2. Vérification cryptographique
      if (lien.signatureHmac !== signature) {
        // 🚨 LOG AUDIT : Tentative de fraude détectée (Signature corrompue)
        auditEventEmitter.emit('log', {
          utilisateurId: utilisateurPayeurId,
          action: 'PAYMENT_LINK_FRAUD_SIGNATURE',
          entite: 'LIEN_PAIEMENT',
          avant: { codeUnique, signatureFournie: signature },
          apres: { signatureAttendue: lien.signatureHmac },
          ip: contextRequest.ip,
          navigateur: contextRequest.userAgent
        });
        logger.security(`Alerte Securité : Signature invalide pour le lien ${codeUnique} par l'utilisateur ${utilisateurPayeurId}`);
        
        throw new Error("Opération rejected. Signature cryptographique du lien invalide.");
      }

      if (lien.utilisateurId === utilisateurPayeurId) {
        throw new Error("Opération impossible : Vous ne pouvez pas payer votre propre lien.");
      }

      // 3. Exécution de ta transaction financière globale (INCHANGÉE)
      const resultatTransaction = await prisma.$transaction(async (tx) => {
        
        const agregateurActif = await tx.agregateur.findFirst({
          where: { statut: "ACTIF" }
        });

        if (!agregateurActif) {
          throw new Error("Erreur système : Aucun agrégateur actif n'est configuré sur la plateforme.");
        }

        const payeur = await tx.utilisateur.findUnique({
          where: { id: utilisateurPayeurId },
          include: { portefeuille: true }
        });
        const receveur = await tx.utilisateur.findUnique({
          where: { id: lien.utilisateurId },
          include: { portefeuille: true }
        });

        if (!payeur || !payeur.portefeuille) throw new Error("Portefeuille du payeur introuvable.");
        if (!receveur || !receveur.portefeuille) throw new Error("Portefeuille du bénéficiaire introuvable.");

        const walletPayeur = payeur.portefeuille;
        let walletReceveur = lien.portefeuilleId 
          ? await tx.portefeuille.findUnique({ where: { id: lien.portefeuilleId } })
          : receveur.portefeuille;

        if (!walletReceveur) {
          walletReceveur = receveur.portefeuille;
        }

        const geoPayeur = currencyHelper.detecterParTelephone(payeur.telephone);
        const deviseSource = walletPayeur.devise || walletPayeur.currency;
        const deviseCible = walletReceveur.devise || walletReceveur.currency;

        if (!deviseSource || !deviseCible) {
          throw new Error("Rupture d'intégrité financière : La devise d'un des portefeuilles est introuvable.");
        }

        if (!geoPayeur || !geoPayeur.pays) {
          throw new Error("Échec de compliance : Impossible de déterminer le pays d'origine.");
        }
        const paysIdOp = geoPayeur.pays;

        // 🛑 CAS D'ÉCHEC : Solde Insuffisant détecté au cours de la transaction
        if (parseFloat(walletPayeur.solde) < montantSaisi) {
          // On crée l'historique d'échec pour le client
          await tx.transaction.create({
            data: {
              type: "TRANSFERT",
              montant: montantSaisi,
              deviseSource,
              deviseCible,
              statut: "ECHEC",
              description: `Échec du paiement par lien ${codeUnique} : Solde insuffisant.`,
              paysOperation: paysIdOp,
              walletSourceId: walletPayeur.id,
              agregateurId: agregateurActif.id
            }
          });

          // On lève l'erreur pour annuler les autres opérations
          throw new Error(`SOLDE_INSUFFISANT:Il vous faut ${montantSaisi} ${deviseSource} pour honorer ce paiement.`);
        }

        // --- Début de tes calculs inchangés ---
        const configFraisLien = await tx.configurationGenerale.findUnique({
          where: { cle: "FRAIS_LIEN_PAIEMENT" }
        });

        if (!configFraisLien) throw new Error("La configuration 'FRAIS_LIEN_PAIEMENT' est manquante.");

        const tauxFraisTransfert = parseFloat(configFraisLien.valeur);
        const tauxApplique = currencyHelper.obtenirTauxStatique(deviseSource, deviseCible);

        const montantConvertiBrut = montantSaisi * tauxApplique;
        const fraisOp = montantConvertiBrut * tauxFraisTransfert;
        const montantNetPourReceveur = montantConvertiBrut - fraisOp;

        // Débits / Crédits
        await tx.portefeuille.update({
          where: { id: walletPayeur.id },
          data: { solde: { decrement: montantSaisi } }
        });

        await tx.portefeuille.update({
          where: { id: walletReceveur.id },
          data: { solde: { increment: montantNetPourReceveur } }
        });

        // Gestion Admin / Coffre
        const adminActif = await tx.utilisateur.findFirst({
          where: { role: 'ADMIN' },
          include: { portefeuille: true }
        });

        if (adminActif && adminActif.portefeuille) {
          const walletAdmin = adminActif.portefeuille;
          const deviseAdmin = walletAdmin.devise || walletAdmin.currency;
          const tauxConversionAdmin = currencyHelper.obtenirTauxStatique(deviseCible, deviseAdmin);
          const fraisConvertisPourAdmin = fraisOp * tauxConversionAdmin;

          await tx.portefeuille.update({
            where: { id: walletAdmin.id },
            data: { solde: { increment: fraisConvertisPourAdmin } }
          });

          await tx.coffreUniPay.upsert({
            where: { id: 'global_vault' },
            update: { cumulGainsXAF: { increment: fraisConvertisPourAdmin } },
            create: { id: 'global_vault', cumulGainsXAF: fraisConvertisPourAdmin }
          });
        } else {
          await tx.coffreUniPay.upsert({
            where: { id: `vault_${deviseCible}` },
            update: { cumulGainsXAF: { increment: fraisOp } },
            create: { id: `vault_${deviseCible}`, cumulGainsXAF: fraisOp }
          });
        }

        const messageHistorique = `Vous avez reçu un paiement de ${montantSaisi} ${deviseSource}...`;

        const transactionHistorique = await tx.transaction.create({
          data: {
            type: "TRANSFERT",
            montant: montantSaisi,
            deviseSource,
            deviseCible,
            tauxApplique,
            montantConverti: montantNetPourReceveur,
            statut: "SUCCES",
            frais: fraisOp,
            gainSpread: 0,
            description: messageHistorique,
            paysOperation: paysIdOp,
            lienPaiement: { connect: { id: lien.id } },
            walletSource: { connect: { id: walletPayeur.id } },
            agregateur: { connect: { id: agregateurActif.id } }
          }
        });

        return {
          statut: "SUCCES",
          transactionId: transactionHistorique.id,
          confirmationPayeur: `Paiement réussi ! Vous avez envoyé ${montantSaisi} ${deviseSource}.`,
          notificationBeneficiaire: messageHistorique,
          historiqueTransparent: {
            recuExactement: montantSaisi,
            deviseSource,
            fraisAppliques: `${(tauxFraisTransfert * 100).toFixed(1)}%`,
            montantRevientNet: montantNetPourReceveur,
            deviseCible
          }
        };
      });

      // 🟢 LOG AUDIT SUCCÈS (Asynchrone hors de la transaction)
      auditEventEmitter.emit('log', {
        utilisateurId: utilisateurPayeurId,
        action: 'PAYMENT_LINK_SUCCESS',
        entite: 'TRANSACTION',
        apres: { transactionId: resultatTransaction.transactionId, montant: montantSaisi },
        ip: contextRequest.ip,
        navigateur: contextRequest.userAgent
      });

      return resultatTransaction;

    } catch (error) {
      // 🛑 CAPTURE DE TOUS LES ÉCHECS SANS CASSER LE FLUX FLUTTER
      let messageErreur = error.message;
      
      if (error.message.startsWith('SOLDE_INSUFFISANT:')) {
        messageErreur = error.message.split(':')[1];
        auditEventEmitter.emit('log', {
          utilisateurId: utilisateurPayeurId,
          action: 'PAYMENT_LINK_REJECTED_INSOLVENT',
          entite: 'TRANSACTION',
          avant: { codeUnique, montantTente: montant },
          ip: contextRequest.ip,
          navigateur: contextRequest.userAgent
        });
      } else {
        // Erreurs systèmes inattendues
        auditEventEmitter.emit('log', {
          utilisateurId: utilisateurPayeurId,
          action: 'PAYMENT_LINK_CRASH',
          entite: 'SYSTEME',
          avant: { error: error.message },
          ip: contextRequest.ip,
          navigateur: contextRequest.userAgent
        });
      }

      // On propage l'erreur propre nettoyée pour le contrôleur
      throw new Error(messageErreur);
    }
  }
}

module.exports = new TransferLinkService();