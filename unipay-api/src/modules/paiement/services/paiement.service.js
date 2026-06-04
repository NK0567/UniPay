const prisma = require('../../../database/prisma');
const agregateurManager = require('../../agrégateur/services/agregateur.manager');
const securiteService = require('../../sécurité/services/securite.service');
const currencyHelper = require('../../../helpers/currency.helper');
const auditEventEmitter = require('../../../events/audit.event');
const logger = require('../../../utils/logger');
const notificationEventEmitter = require('../../../events/notification.event');
const configurationService = require('../../configuration/services/configuration.service');

class PaiementService {
  
  async calculerFraisRetrait(montantBrut) {
    const pourcentageFrais = await configurationService.obtenirNombre('FRAIS_RETRAIT_STANDARD', 0.015);
    return montantBrut * pourcentageFrais;
  }

  /**
   * 💰 1. OPÉRATION DE DÉPÔT (CASH-IN)
   */
  async executerDepot(utilisateurId, { telephone, montant }) {
    const montantSaisi = parseFloat(montant);
    if (isNaN(montantSaisi) || montantSaisi <= 0) {
      throw new Error("Le montant du dépôt doit être supérieur à 0.");
    }

    // 🌍 DÉTECTION AUTOMATIQUE DU PAYS VIA LE NUMÉRO DE TÉLÉPHONE
    const geoInfo = currencyHelper.detecterParTelephone(telephone); 
    const paysCode = geoInfo?.pays || "CM"; // Fallback de sécurité au besoin

    const portefeuille = await prisma.portefeuille.findUnique({
      where: { utilisateurId }
    });

    if (!portefeuille || portefeuille.statut !== "ACTIF") {
      throw new Error("Votre portefeuille UniPay est introuvable ou inactif.");
    }

    const deviseUser = portefeuille.devise;

    // 🧠 SMART ROUTING avec le pays détecté automatiquement
    const agregateurOptimal = await agregateurManager.selectionnerMeilleurAgregateur(paysCode, "DEPOT");
    const provider = agregateurManager.getProviderService(agregateurOptimal);

    const configFraisClient = await prisma.configurationSysteme.findUnique({
      where: { cle: "FRAIS_DEPOT_STANDARD" }
    });
    const tauxFraisClient = configFraisClient ? parseFloat(configFraisClient.valeur) : 0.02;

    const fraisFacturesAuClient = montantSaisi * tauxFraisClient;
    const montantTotalADebiterDuMobile = montantSaisi + fraisFacturesAuClient;

    const commissionAgregateurPct = parseFloat(agregateurOptimal.commissionPct);
    const fraisFixesAgregateur = parseFloat(agregateurOptimal.fraisFixes);
    const coutReelAgregateur = (montantSaisi * commissionAgregateurPct) + fraisFixesAgregateur;

    const margeBruteUniPay = fraisFacturesAuClient - coutReelAgregateur;

    if (margeBruteUniPay < 0) {
      throw new Error("Rupture de rentabilité : Les frais de l'agrégateur dépassent les frais clients d'UniPay.");
    }

    const referenceUniPay = `DEP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const reponseOperateur = await provider.encaisserDepot(telephone, montantTotalADebiterDuMobile, referenceUniPay);

    if (reponseOperateur.statutOperateur !== "SUCCES") {
      await prisma.transaction.create({
        data: {
          type: "DEPOT",
          montant: montantSaisi,
          deviseSource: deviseUser,
          deviseCible: deviseUser,
          statut: "ECHEC",
          motifEchec: reponseOperateur.motif || "REJET_OPERATEUR",
          description: `Échec du dépôt via ${agregateurOptimal.nom}. Motif : ${reponseOperateur.motif}`,
          walletSourceId: portefeuille.id,
          agregateurId: agregateurOptimal.id,
          referenceMarchand: referenceUniPay
        }
      });
      throw new Error(`Le transfert mobile a échoué : ${reponseOperateur.motif || "Transaction déclinée"}`);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.portefeuille.update({
        where: { id: portefeuille.id },
        data: { solde: { increment: montantSaisi } }
      });

      const adminActif = await tx.utilisateur.findFirst({
        where: { role: 'ADMIN' },
        include: { portefeuille: true }
      });

      let gainFinalVerstAdmin = margeBruteUniPay;
      let deviseAdmin = deviseUser;

      if (adminActif && adminActif.portefeuille) {
        deviseAdmin = adminActif.portefeuille.devise;
        const tauxConversionAdmin = currencyHelper.obtenirTauxStatique(deviseUser, deviseAdmin);
        gainFinalVerstAdmin = margeBruteUniPay * tauxConversionAdmin;

        await tx.portefeuille.update({
          where: { id: adminActif.portefeuille.id },
          data: { solde: { increment: gainFinalVerstAdmin } }
        });

        await tx.coffreUniPay.upsert({
          where: { id: 'global_vault' },
          update: { cumulGainsXAF: { increment: gainFinalVerstAdmin } },
          create: { id: 'global_vault', cumulGainsXAF: gainFinalVerstAdmin }
        });
      } else {
        await tx.coffreUniPay.upsert({
          where: { id: `vault_${deviseUser}` },
          update: { cumulGainsXAF: { increment: margeBruteUniPay } },
          create: { id: `vault_${deviseUser}`, cumulGainsXAF: margeBruteUniPay }
        });
      }

      const transactionHistorique = await tx.transaction.create({
        data: {
          type: "DEPOT",
          montant: montantSaisi,
          deviseSource: deviseUser,
          deviseCible: deviseUser,
          statut: "SUCCES",
          frais: fraisFacturesAuClient,
          gainSpread: margeBruteUniPay,
          paysOperation: paysCode,
          description: `Dépôt réussi de ${montantSaisi} ${deviseUser} via ${agregateurOptimal.nom}.`,
          walletSourceId: portefeuille.id,
          agregateurId: agregateurOptimal.id,
          referenceMarchand: referenceUniPay,
          source: telephone,
          destination: portefeuille.id
        }
      });

      notificationEventEmitter.emit('transaction.succes', {
        utilisateurId: portefeuille.utilisateurId,
        telephone,
        montant: montantSaisi,
        devise: deviseUser,
        type: "DEPOT"
      });

      return {
        statut: "SUCCES",
        transactionId: transactionHistorique.id,
        montantCredite: montantSaisi,
        devise: deviseUser,
        referenceUniPay,
        margeGenereeUniPay: `${gainFinalVerstAdmin.toFixed(2)} ${deviseAdmin}`
      };
    });
  }

  /**
   * 🏧 2. OPÉRATION DE RETRAIT (CASH-OUT)
   */
  async executerRetrait(utilisateurId, { telephone, montant }, ip = null) {
    if (ip) {
      await securiteService.inspecterActiviteUtilisateur(utilisateurId, ip);
    }
    const montantSaisi = parseFloat(montant);
    if (isNaN(montantSaisi) || montantSaisi <= 0) {
      throw new Error("Le montant du retrait doit être supérieur à 0.");
    }

    // 🌍 DÉTECTION AUTOMATIQUE DU PAYS VIA LE NUMÉRO DE TÉLÉPHONE
    const geoInfo = currencyHelper.detecterParTelephone(telephone);
    const paysCode = geoInfo?.pays || "CM";

    const portefeuille = await prisma.portefeuille.findUnique({
      where: { utilisateurId }
    });

    if (!portefeuille || portefeuille.statut !== "ACTIF") {
      throw new Error("Votre portefeuille UniPay est introuvable ou inactif.");
    }

    const deviseUser = portefeuille.devise;

    // 🧠 SMART ROUTING avec le pays détecté automatiquement
    const agregateurOptimal = await agregateurManager.selectionnerMeilleurAgregateur(paysCode, "RETRAIT");
    const provider = agregateurManager.getProviderService(agregateurOptimal);

    const configFraisClient = await prisma.configurationSysteme.findUnique({
      where: { cle: "FRAIS_RETRAIT_STANDARD" }
    });
    const tauxFraisClient = configFraisClient ? parseFloat(configFraisClient.valeur) : 0.015;

    const fraisRetraitClient = montantSaisi * tauxFraisClient;
    const montantTotalADeduireDuSoldeUniPay = montantSaisi + fraisRetraitClient;

    const commissionAgregateurPct = parseFloat(agregateurOptimal.commissionPct);
    const fraisFixesAgregateur = parseFloat(agregateurOptimal.fraisFixes);
    const coutReelAgregateur = (montantSaisi * commissionAgregateurPct) + fraisFixesAgregateur;

    const margeBruteUniPay = fraisRetraitClient - coutReelAgregateur;

    if (parseFloat(portefeuille.solde) < montantTotalADeduireDuSoldeUniPay) {
      throw new Error(`Solde UniPay insuffisant. Il vous faut un total de ${montantTotalADeduireDuSoldeUniPay} ${deviseUser} (frais inclus) pour effectuer ce retrait.`);
    }

    const referenceUniPay = `WIT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const reponseOperateur = await provider.envoyerRetrait(telephone, montantSaisi, referenceUniPay);

    if (reponseOperateur.statutOperateur !== "SUCCES") {
      await prisma.transaction.create({
        data: {
          type: "RETRAIT",
          montant: montantSaisi,
          deviseSource: deviseUser,
          deviseCible: deviseUser,
          statut: "ECHEC",
          motifEchec: reponseOperateur.motif || "REJET_TRANSFERT_OPERATEUR",
          description: `Échec du virement de retrait via ${agregateurOptimal.nom}.`,
          walletSourceId: portefeuille.id,
          agregateurId: agregateurOptimal.id,
          referenceMarchand: referenceUniPay
        }
      });
      throw new Error(`L'opérateur de paiement mobile a rejeté le virement : ${reponseOperateur.motif || "Erreur réseau"}`);
    }

    return await prisma.$transaction(async (tx) => {
      await tx.portefeuille.update({
        where: { id: portefeuille.id },
        data: { solde: { decrement: montantTotalADeduireDuSoldeUniPay } }
      });

      const adminActif = await tx.utilisateur.findFirst({
        where: { role: 'ADMIN' },
        include: { portefeuille: true }
      });

      let gainFinalVerstAdmin = margeBruteUniPay;
      let deviseAdmin = deviseUser;

      if (adminActif && adminActif.portefeuille) {
        deviseAdmin = adminActif.portefeuille.devise;
        const tauxConversionAdmin = currencyHelper.obtenirTauxStatique(deviseUser, deviseAdmin);
        gainFinalVerstAdmin = margeBruteUniPay * tauxConversionAdmin;

        await tx.portefeuille.update({
          where: { id: adminActif.portefeuille.id },
          data: { solde: { increment: gainFinalVerstAdmin } }
        });
      }

      const transactionHistorique = await tx.transaction.create({
        data: {
          type: "RETRAIT",
          montant: montantSaisi,
          deviseSource: deviseUser,
          deviseCible: deviseUser,
          statut: "SUCCES",
          frais: fraisRetraitClient,
          gainSpread: margeBruteUniPay,
          paysOperation: paysCode,
          description: `Retrait effectué avec succès de ${montantSaisi} ${deviseUser} vers le numéro ${telephone}.`,
          walletSourceId: portefeuille.id,
          agregateurId: agregateurOptimal.id,
          referenceMarchand: referenceUniPay,
          source: portefeuille.id,
          destination: telephone
        }
      });

      return {
        statut: "SUCCES",
        transactionId: transactionHistorique.id,
        montantRetire: montantSaisi,
        fraisAppliques: fraisRetraitClient,
        devise: deviseUser,
        referenceUniPay
      };
    });
  }
}

module.exports = new PaiementService();