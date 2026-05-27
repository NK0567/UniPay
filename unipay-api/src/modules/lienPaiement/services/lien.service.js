const crypto = require('crypto');
const prisma = require('../../../database/prisma');
const transferLinkRepository = require('../repositories/lien.repository');
const currencyHelper = require('../../../helpers/currency.helper');
const cryptoUtil = require('../../../utils/crypto.util');
const authRepository = require('../../auth/repositories/auth.repository');
const transactionRepository = require('../../transaction/repositories/transaction.repository');

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

  async executerPaiementLienSecurise(utilisateurPayeurId, { codeUnique, signature, montant }) {
    const montantSaisi = parseFloat(montant);
    if (isNaN(montantSaisi) || montantSaisi <= 0) {
      throw new Error("Le montant du paiement doit être supérieur à 0.");
    }

    // 1. Récupérer le lien actif (Prisma vérifie le statut ACTIF et la date d'expiration)
    const lien = await transferLinkRepository.trouverLienValide(codeUnique);
    if (!lien) {
      throw new Error("Ce lien de paiement est invalide, inactif ou a expiré (validité de 24h dépassée).");
    }

    // 2. Vérification cryptographique par comparaison directe avec la signature de la BD
    if (lien.signatureHmac !== signature) {
      throw new Error("Opération rejetée. Signature cryptographique du lien invalide.");
    }

    // Sécurité : Interdire de payer son propre lien
    if (lien.utilisateurId === utilisateurPayeurId) {
      throw new Error("Opération impossible : Vous ne pouvez pas payer votre propre lien.");
    }

    // 3. Exécution de la transaction financière globale
    return await prisma.$transaction(async (tx) => {

      // 💡 AJOUT : Récupérer l'agrégateur actif configuré sur la plateforme
      const agregateurActif = await tx.agregateur.findFirst({
        where: { statut: "ACTIF" } // ou selon les critères de ton seed (ex: nom: "UniPay Modial")
      });

      if (!agregateurActif) {
        throw new Error("Erreur système : Aucun agrégateur actif n'est configuré sur la plateforme.");
      }

      // Récupération des profils et des portefeuilles des acteurs
      const payeur = await tx.utilisateur.findUnique({
        where: { id: utilisateurPayeurId },
        include: { portefeuille: true }
      });
      const receveur = await tx.utilisateur.findUnique({
        where: { id: lien.utilisateurId },
        include: { portefeuille: true }
      });

      if (!payeur || !payeur.portefeuille) {
        throw new Error("Portefeuille du payeur introuvable.");
      }
      if (!receveur || !receveur.portefeuille) {
        throw new Error("Portefeuille du bénéficiaire introuvable.");
      }

      const walletPayeur = payeur.portefeuille;

      // Gestion de l'asynchronisme propre pour le portefeuille cible du lien
      let walletReceveur = null;
      if (lien.portefeuilleId) {
        walletReceveur = await tx.portefeuille.findUnique({ where: { id: lien.portefeuilleId } });
      }

      if (!walletReceveur) {
        walletReceveur = receveur.portefeuille;
      }

      // Détection automatique du pays de l'opération via le téléphone du payeur
      const geoPayeur = currencyHelper.detecterParTelephone(payeur.telephone);

      // 1. Extraction stricte des devises depuis la BDD (aucune valeur par défaut tolérée)
      const deviseSource = walletPayeur.devise || walletPayeur.currency;
      const deviseCible = walletReceveur.devise || walletReceveur.currency;

      if (!deviseSource || !deviseCible) {
        throw new Error("Rupture d'intégrité financière : La devise d'un des portefeuilles est introuvable en base de données.");
      }

      // 2. ✅ CORRECTION : Utilisation de geoPayeur.pays au lieu de paysId
      if (!geoPayeur || !geoPayeur.pays) {
        throw new Error("Échec de conformité (Compliance) : Impossible de déterminer le pays d'origine de l'opération depuis le numéro du payeur.");
      }
      const paysIdOp = geoPayeur.pays; // Reçoit "CM" dynamiquement sans valeur en dur

      // Vérification des fonds du payeur dans sa propre devise
      if (parseFloat(walletPayeur.solde) < montantSaisi) {
        throw new Error(`Solde insuffisant. Il vous faut ${montantSaisi} ${deviseSource} pour honorer ce paiement.`);
      }

      // =================================================================
      // 4. ⚙️ Récupération dynamique du taux via ConfigurationGenerale
      // =================================================================
      const configFraisLien = await tx.configurationGenerale.findUnique({
        where: { cle: "FRAIS_LIEN_PAIEMENT" }
      });

      if (!configFraisLien) {
        throw new Error("Erreur système : La configuration 'FRAIS_LIEN_PAIEMENT' est manquante en base de données.");
      }

      const tauxFraisTransfert = parseFloat(configFraisLien.valeur);

      // Calcul des taux de change dynamiques via ton Currency Helper
      const tauxApplique = currencyHelper.obtenirTauxStatique(deviseSource, deviseCible);

      // Calcul des montants
      const montantConvertiBrut = montantSaisi * tauxApplique;
      const fraisOp = montantConvertiBrut * tauxFraisTransfert;
      const montantNetPourReceveur = montantConvertiBrut - fraisOp;

      // 5. Mouvements financiers entre les portefeuilles des utilisateurs
      // Débit du payeur
      await tx.portefeuille.update({
        where: { id: walletPayeur.id },
        data: { solde: { decrement: montantSaisi } }
      });

      // Crédit du bénéficiaire (Montant net de frais)
      await tx.portefeuille.update({
        where: { id: walletReceveur.id },
        data: { solde: { increment: montantNetPourReceveur } }
      });

      // =================================================================
      // 6. 🧠 ROUTAGE ET CONVERSION DYNAMIQUE POUR L'ADMIN OU COFFRE
      // =================================================================
      const adminActif = await tx.utilisateur.findFirst({
        where: { role: 'ADMIN' },
        include: { portefeuille: true }
      });

      if (adminActif && adminActif.portefeuille) {
        const walletAdmin = adminActif.portefeuille;
        const deviseAdmin = walletAdmin.devise || walletAdmin.currency;

        // Conversion dynamique vers la devise de l'admin
        const tauxConversionAdmin = currencyHelper.obtenirTauxStatique(deviseCible, deviseAdmin);
        const fraisConvertisPourAdmin = fraisOp * tauxConversionAdmin;

        // Crédit du portefeuille de l'admin
        await tx.portefeuille.update({
          where: { id: walletAdmin.id },
          data: { solde: { increment: fraisConvertisPourAdmin } }
        });

        // Mise à jour de ton vrai champ comptable statistique `cumulGainsXAF`
        await tx.coffreUniPay.upsert({
          where: { id: 'global_vault' },
          update: { cumulGainsXAF: { increment: fraisConvertisPourAdmin } },
          create: { id: 'global_vault', cumulGainsXAF: fraisConvertisPourAdmin }
        });
      } else {
        // Si aucun Admin, stockage sécurisé par devise isolée dans ton champ réel `cumulGainsXAF`
        await tx.coffreUniPay.upsert({
          where: { id: `vault_${deviseCible}` },
          update: { cumulGainsXAF: { increment: fraisOp } },
          create: { id: `vault_${deviseCible}`, cumulGainsXAF: fraisOp }
        });
      }

      // 7. Génération de l'historique transparent complet
      const messageHistorique = `Vous avez reçu un paiement de ${montantSaisi} ${deviseSource}. Après conversion au taux de ${tauxApplique} et application des frais de traitement UniPay de ${fraisOp.toFixed(2)} ${deviseCible}, votre compte a été crédité de ${montantNetPourReceveur.toFixed(2)} ${deviseCible}.`;

      const transactionHistorique = await tx.transaction.create({
        data: {
          type: "TRANSFERT",
          montant: montantSaisi,
          deviseSource: deviseSource,
          deviseCible: deviseCible,
          tauxApplique: tauxApplique,
          montantConverti: montantNetPourReceveur,
          statut: "SUCCES",
          frais: fraisOp,
          gainSpread: 0,
          description: messageHistorique,
          paysOperation: paysIdOp,
          lienPaiement: {
            connect: { id: lien.id }
          },
          walletSource: {
            connect: { id: walletPayeur.id }
          },
          agregateur: {
            connect: { id: agregateurActif.id }
          }
        }
      });

      return {
        statut: "SUCCES",
        transactionId: transactionHistorique.id,
        confirmationPayeur: `Paiement réussi ! Vous avez envoyé ${montantSaisi} ${deviseSource}.`,
        notificationBeneficiaire: messageHistorique,
        historiqueTransparent: {
          recuExactement: montantSaisi,
          deviseSource: deviseSource,
          fraisAppliques: `${(tauxFraisTransfert * 100).toFixed(1)}% (${fraisOp.toFixed(2)} ${deviseCible})`,
          montantRevientNet: montantNetPourReceveur,
          deviseCible: deviseCible
        }
      };
    });
  }
}

module.exports = new TransferLinkService();