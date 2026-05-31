const prisma = require('../../../database/prisma');
const agregateurManager = require('../../agrégateur/service/agregateur.manager');
const currencyHelper = require('../../../helpers/currency.helper');
const auditEventEmitter = require('../../../events/audit.event');
const logger = require('../../../utils/logger');
const notificationEventEmitter = require('../../events/notification.event');
const configurationService = require('../../configuration/services/configuration.service');

class PaiementService {
  /**
   * 💰 1. OPÉRATION DE DÉPÔT (CASH-IN)
   * Permet à un utilisateur de charger son portefeuille via Mobile Money
   */
    async calculerFraisRetrait(montantBrut) {
        // Va chercher la valeur 'FRAIS_RETRAIT_STANDARD' en BDD, si inexistante prend 0.015 (1.5%)
        const pourcentageFrais = await configurationService.obtenirNombre('FRAIS_RETRAIT_STANDARD', 0.015);
  
        return montantBrut * pourcentageFrais;
    }

  async executerDepot(utilisateurId, { telephone, montant, paysCode }) {
    const montantSaisi = parseFloat(montant);
    if (isNaN(montantSaisi) || montantSaisi <= 0) {
      throw new Error("Le montant du dépôt doit être supérieur à 0.");
    }

    // 1. Récupérer le portefeuille de l'utilisateur
    const portefeuille = await prisma.portefeuille.findUnique({
      where: { utilisateurId }
    });

    if (!portefeuille || portefeuille.statut !== "ACTIF") {
      throw new Error("Votre portefeuille UniPay est introuvable ou inactif.");
    }

    const deviseUser = portefeuille.devise;

    // 2. 🧠 SMART ROUTING : Sélection automatique de l'agrégateur le moins cher
    const agregateurOptimal = await agregateurManager.selectionnerMeilleurAgregateur(paysCode, "DEPOT");
    const provider = agregateurManager.getProviderService(agregateurOptimal);

    // 3. Récupérer la politique tarifaire client d'UniPay pour les dépôts depuis la BDD
    const configFraisClient = await prisma.configurationSysteme.findUnique({
      where: { cle: "FRAIS_DEPOT_STANDARD" }
    });
    const tauxFraisClient = configFraisClient ? parseFloat(configFraisClient.valeur) : 0.02; // 2% par défaut

    // 4. Calculs financiers (Split de commissions)
    const fraisFacturesAuClient = montantSaisi * tauxFraisClient;
    const montantTotalADebiterDuMobile = montantSaisi + fraisFacturesAuClient;

    const commissionAgregateurPct = parseFloat(agregateurOptimal.commissionPct);
    const fraisFixesAgregateur = parseFloat(agregateurOptimal.fraisFixes);
    const coutReelAgregateur = (montantSaisi * commissionAgregateurPct) + fraisFixesAgregateur;

    // 🔥 Gain additionnel généré grâce au Smart Routing !
    const margeBruteUniPay = fraisFacturesAuClient - coutReelAgregateur;

    if (margeBruteUniPay < 0) {
      throw new Error("Rupture de rentabilité : Les frais de l'agrégateur dépassent les frais clients d'UniPay.");
    }

    // 5. 📞 APPEL DE L'AGRÉGATEUR (Simulé ou réel selon le statut de l'agrégateur)
    // On génère une référence unique pour le tracking opérateur
    const referenceUniPay = `DEP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const reponseOperateur = await provider.encaisserDepot(telephone, montantTotalADebiterDuMobile, referenceUniPay);

    if (reponseOperateur.statutOperateur !== "SUCCES") {
      // Si l'opérateur rejette (ex: solde insuffisant sur le compte MTN/Orange du client)
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

    // 6. 🔐 TRANSACTION ATOMIQUE PRISMA EN CAS DE SUCCÈS OPERATEUR
    return await prisma.$transaction(async (tx) => {
      // A. Créditer le portefeuille de l'utilisateur avec le montant brut demandé
      await tx.portefeuille.update({
        where: { id: portefeuille.id },
        data: { solde: { increment: montantSaisi } }
      });

      // B. 🌍 RÈGLE D'OR : Envoi des bénéfices vers l'admin sous sa devise propre
      const adminActif = await tx.utilisateur.findFirst({
        where: { role: 'ADMIN' },
        include: { portefeuille: true }
      });

      let gainFinalVerstAdmin = margeBruteUniPay;
      let deviseAdmin = deviseUser;

      if (adminActif && adminActif.portefeuille) {
        deviseAdmin = adminActif.portefeuille.devise;
        // Calcul du taux de change si la devise admin est différente de la devise locale de l'opération
        const tauxConversionAdmin = currencyHelper.obtenirTauxStatique(deviseUser, deviseAdmin);
        gainFinalVerstAdmin = margeBruteUniPay * tauxConversionAdmin;

        // Crédit immédiat de la marge sur le portefeuille de l'admin
        await tx.portefeuille.update({
          where: { id: adminActif.portefeuille.id },
          data: { solde: { increment: gainFinalVerstAdmin } }
        });

        // Historisation comptable statistique du coffre
        await tx.coffreUniPay.upsert({
          where: { id: 'global_vault' },
          update: { cumulGainsXAF: { increment: gainFinalVerstAdmin } },
          create: { id: 'global_vault', cumulGainsXAF: gainFinalVerstAdmin }
        });
      } else {
        // En l'absence d'un compte admin configuré, stockage sécurisé par devise isolée dans le coffre
        await tx.coffreUniPay.upsert({
          where: { id: `vault_${deviseUser}` },
          update: { cumulGainsXAF: { increment: margeBruteUniPay } },
          create: { id: `vault_${deviseUser}`, cumulGainsXAF: margeBruteUniPay }
        });
      }

      // C. Inscription de la transaction finale en BDD
      const transactionHistorique = await tx.transaction.create({
        data: {
          type: "DEPOT",
          montant: montantSaisi,
          deviseSource: deviseUser,
          deviseCible: deviseUser,
          statut: "SUCCES",
          frais: fraisFacturesAuClient,
          gainSpread: margeBruteUniPay, // Ta marge nette après paiement de l'agrégateur
          paysOperation: paysCode,
          description: `Dépôt réussi de ${montantSaisi} ${deviseUser} via ${agregateurOptimal.nom}. Réf Opérateur: ${reponseOperateur.transactionIdFournisseur}`,
          walletSourceId: portefeuille.id,
          agregateurId: agregateurOptimal.id,
          referenceMarchand: referenceUniPay,
          source: telephone,
          destination: portefeuille.id
        }
      });

      return {
        statut: "SUCCES",
        transactionId: transactionHistorique.id,
        montantCredite: montantSaisi,
        devise: deviseUser,
        referenceUniPay,
        margeGenereeUniPay: `${gainFinalVerstAdmin.toFixed(2)} ${deviseAdmin}`,
        // À la fin de ton traitement de transaction réussie :
notificationEventEmitter.emit('transaction.succes', {
  utilisateurId: portefeuille.utilisateurId,
  telephone: "2376XXXXXXXX", // Le téléphone de l'utilisateur
  montant: transaction.montant,
  devise: portefeuille.devise,
  type: "RETRAIT"
});
      };
    });
  }

  /**
   * 🏧 2. OPÉRATION DE RETRAIT (CASH-OUT)
   * Permet à un utilisateur de retirer des fonds de son portefeuille vers son Mobile Money
   */
  async executerRetrait(utilisateurId, { telephone, montant, paysCode }) {
    const ip = req.ip; // Tu pourras récupérer la vraie IP depuis req.ip dans le contrôleur
    await securiteService.inspecterActiviteUtilisateur(utilisateurId, ip);
    const montantSaisi = parseFloat(montant);
    if (isNaN(montantSaisi) || montantSaisi <= 0) {
      throw new Error("Le montant du retrait doit être supérieur à 0.");
    }

    // 1. Récupérer le portefeuille de l'utilisateur
    const portefeuille = await prisma.portefeuille.findUnique({
      where: { utilisateurId }
    });

    if (!portefeuille || portefeuille.statut !== "ACTIF") {
      throw new Error("Votre portefeuille UniPay est introuvable ou inactif.");
    }

    const deviseUser = portefeuille.devise;

    // 2. 🧠 SMART ROUTING : Sélection automatique de l'agrégateur de retrait le moins cher
    const agregateurOptimal = await agregateurManager.selectionnerMeilleurAgregateur(paysCode, "RETRAIT");
    const provider = agregateurManager.getProviderService(agregateurOptimal);

    // 3. Récupérer la politique tarifaire client d'UniPay pour les retraits depuis la BDD
    const configFraisClient = await prisma.configurationSysteme.findUnique({
      where: { cle: "FRAIS_RETRAIT_STANDARD" }
    });
    const tauxFraisClient = configFraisClient ? parseFloat(configFraisClient.valeur) : 0.015; // 1.5% par défaut

    // 4. Calculs financiers
    const fraisRetraitClient = montantSaisi * tauxFraisClient;
    const montantTotalADeduireDuSoldeUniPay = montantSaisi + fraisRetraitClient;

    const commissionAgregateurPct = parseFloat(agregateurOptimal.commissionPct);
    const fraisFixesAgregateur = parseFloat(agregateurOptimal.fraisFixes);
    const coutReelAgregateur = (montantSaisi * commissionAgregateurPct) + fraisFixesAgregateur;

    // Marge nette UniPay sur le retrait
    const margeBruteUniPay = fraisRetraitClient - coutReelAgregateur;

    // 5. Vérification stricte des fonds dispo sur UniPay AVANT d'ordonner le virement externe
    if (parseFloat(portefeuille.solde) < montantTotalADeduireDuSoldeUniPay) {
      throw new Error(`Solde UniPay insuffisant. Il vous faut un total de ${montantTotalADeduireDuSoldeUniPay} ${deviseUser} (frais inclus) pour effectuer ce retrait.`);
    }

    // 6. 📞 ORDRE DE TRANSFERT À L'AGRÉGATEUR (Virement vers le Mobile Money du client)
    const referenceUniPay = `WIT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const reponseOperateur = await provider.envoyerRetrait(telephone, montantSaisi, referenceUniPay);

    if (reponseOperateur.statutOperateur !== "SUCCES") {
      // Enregistrement de l'échec technique
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

    // 7. 🔐 TRANSACTION ATOMIQUE DE VALIDATION DES COMPTES EN BDD
    return await prisma.$transaction(async (tx) => {
      // A. Débiter le compte de l'utilisateur (Montant + Frais)
      await tx.portefeuille.update({
        where: { id: portefeuille.id },
        data: { solde: { decrement: montantTotalADeduireDuSoldeUniPay } }
      });

      // B. 🌍 RÈGLE D'OR : Envoi des commissions de retrait vers l'admin sous sa devise propre
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

      // C. Création de l'historique transparent pour le retrait
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