const adminRepository = require("../repositories/admin.repository");
const prisma = require("../../../database/prisma");

class AdminService {
  async genererRapportDashboard() {
    const transactions = await adminRepository.trouveTransactionSucces();
    const agregateursBD = await adminRepository.listerTousLesAgregateurs();

    // 💡 Récupération des données globales de masse exigées par ton cahier des charges
    const totalUtilisateurs = await prisma.utilisateur.count();
    
    // Calcul de l'argent total circulant (Masse monétaire présente dans UniPay)
    const sommePortefeuilles = await prisma.portefeuille.aggregate({
      _sum: { solde: true }
    });
    const coffreGlobal = await prisma.coffreUniPay.findUnique({ 
        where: { id: 'global_vault' } 
    });
    const argentCirculantTotal = parseFloat(sommePortefeuilles._sum.solde || 0) + parseFloat(coffreGlobal?.cumulGainsXAF || 0);

    let volumeTransfereTotalXAF = 0;

    // Cases de ventilation détaillées des revenus d'UniPay (Bénéfices nets)
    let revLienPaiement = 0;
    let revConversionSpread = 0;
    let revCartesVirtuelles = 0;
    let revDepotsRetraits = 0;

    const revenusParAgregateur = {};
    const revenusParPays = {};

    for (const tx of transactions) {
      const montantEnXAF = tx.montantConverti ? parseFloat(tx.montantConverti) : parseFloat(tx.montant || 0);
      const fraisEnXAF = parseFloat(tx.frais || 0);
      const spreadEnXAF = parseFloat(tx.gainSpread || 0);

      volumeTransfereTotalXAF += montantEnXAF;

      // Calcul des commissions des partenaires externes pour obtenir le bénéfice net UniPay
      let commissionPartenaireXAF = 0;
      if (tx.agregateur) {
        const pct = parseFloat(tx.agregateur.commissionPct || 0);
        commissionPartenaireXAF = montantEnXAF * pct;
      }

      // Le gain net d'UniPay sur cette transaction précise
      const gainNetUniPay = (fraisEnXAF + spreadEnXAF) - commissionPartenaireXAF;

      // 1. Ventilation des revenus par canal d'activité (Exigence UI)
      if (tx.lienPaiementId || tx.type === "TRANSFERT") {
        revLienPaiement += fraisEnXAF;
      } else if (tx.type === "DEPOT" || tx.type === "RETRAIT") {
        revDepotsRetraits += fraisEnXAF;
      } else if (tx.methodePaiement === "CARTE" || (tx.agregateur && tx.agregateur.type === "CARTE")) {
        revCartesVirtuelles += fraisEnXAF;
      } else {
        // Fallback dans les frais opérationnels
        revLienPaiement += fraisEnXAF;
      }

      // Le spread de conversion de devises alimente sa propre case dédiée
      revConversionSpread += spreadEnXAF;

      // 2. Ventilation par agrégateur physique/virtuel
      const nomAgreg = tx.agregateur ? tx.agregateur.nom : "PAIEMENT_INTERNE";
      revenusParAgregateur[nomAgreg] = (revenusParAgregateur[nomAgreg] || 0) + gainNetUniPay;

      // 3. Ventilation par pays de l'opération
      const pays = tx.paysOperation || "CM";
      revenusParPays[pays] = (revenusParPays[pays] || 0) + gainNetUniPay;
    }

    // Calcul du montant global (Chiffre d'affaires / Bénéfice net cumulé total)
    const montantGlobalBeneficeNet = revLienPaiement + revConversionSpread + revCartesVirtuelles + revDepotsRetraits;

    // Formatage de la liste des agrégateurs pour le tableau du Dashboard
    const listeAgregateursDashboard = agregateursBD.map(ag => ({
      id: ag.id,
      nom: ag.nom,
      type: ag.type,
      pays: ag.pays,
      commission: `${parseFloat(ag.commissionPct) * 100}%`,
      statut: ag.statut,
      revenuGenereNet: Math.round(revenusParAgregateur[ag.nom] || 0)
    }));

    return {
      cards: {
        totalTransactions: transactions.length,
        nombreTotalUtilisateurs: totalUtilisateurs,
        argentCirculantDansUniPay: Math.round(argentCirculantTotal),
        volumeTransfereTotalXAF: Math.round(volumeTransfereTotalXAF),
        montantGlobalBeneficeNetXAF: Math.round(montantGlobalBeneficeNet) // Affiché en gros sur l'UI avec le bouton détails
      },
      boutonDetailsRevenus: {
        bénéficeLienPaiementXAF: Math.round(revLienPaiement),
        bénéficeConversionSpreadXAF: Math.round(revConversionSpread),
        bénéficeCartesVirtuellesXAF: Math.round(revCartesVirtuelles),
        bénéficeDepotsRetraitsXAF: Math.round(revDepotsRetraits)
      },
      revenusParPays,
      listeAgregateursDashboard
    };
  }

  // Clôture journalière vers le portefeuille de l'admin
  async executerClotureJournaliere() {
    const rapport = await this.genererRapportDashboard();
    const montantAverser = rapport.cards.montantGlobalBeneficeNetXAF;

    if (montantAverser <= 0) {
      throw new Error("Le solde des bénéfices nets à reverser est à 0.");
    }

    const portefeuilleAdmin = await adminRepository.obtenirPortefeuilleAdmin();
    if (!portefeuilleAdmin) {
      throw new Error("Impossible de localiser le portefeuille de l'administrateur principal.");
    }

    const dateJour = new Date().toLocaleDateString('fr-FR');
    const logMsg = `Clôture manuelle UniPay du ${dateJour} - Versement des bénéfices cumulés`;

    return await adminRepository.executerVirementGains(portefeuilleAdmin.id, montantAverser, logMsg);
  }

  // 💡 INTÉGRATION DU COFFRE-FORT DE SECOURS (Ton code commenté fiabilisé)
  async recupererFondsDuCoffre(adminId) {
    return await prisma.$transaction(async (tx) => {
      // 1. Récupérer l'état actuel du coffre-fort d'attente
      const coffre = await tx.coffreUniPay.findUnique({
        where: { id: 'global_vault' }
      });

      if (!coffre || parseFloat(coffre.cumulGainsXAF) <= 0) {
        throw new Error("Le coffre-fort UniPay ne contient aucun fonds en attente actuellement.");
      }

      const totalARecuperer = parseFloat(coffre.cumulGainsXAF);

      // 2. Localiser et créditer le portefeuille de l'Admin connecté
      const walletAdmin = await tx.portefeuille.findFirst({
        where: { utilisateurId: adminId }
      });

      if (!walletAdmin) {
        throw new Error("Impossible de localiser votre portefeuille admin pour le transfert.");
      }

      await tx.portefeuille.update({
        where: { id: walletAdmin.id },
        data: { 
            solde: { increment: totalARecuperer } }
      });

      // 3. Remise à zéro complète (Reset) du coffre-fort
      await tx.coffreUniPay.update({
        where: { id: 'global_vault' },
        data: { cumulGainsXAF: 0.0000 }
      });

      return {
        montantRecupere: totalARecuperer,
        devise: "XAF",
        message: `La totalité des bénéfices orphelins (${totalARecuperer} XAF) a été transférée avec succès dans votre portefeuille.`
      };
    });
  }

  async configurerParametre(cle, valeur) {
    return await adminRepository.sauvegarderConfig(
        cle, 
        valeur, 
        "FINANCIER", 
        "Modifié depuis le Dashboard Admin"
    );
  }

  async ajouterNouvelAgregateur(data) {
    return await adminRepository.creerAgregateur(data);
  }

  async basculerAgregateur(id, statut) {
    return await adminRepository.mettreAJourStatutAgregateur(id, statut);
  }
}

module.exports = new AdminService();