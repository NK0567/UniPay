const dashboardRepository = require('../repositories/dashboard.repository');
const walletRepository = require('../../portefeuille/repositories/wallet.repository');

class DashboardService {
  /**
   * Construit le payload du Dashboard pour l'application mobile
   */
  async genererDashboardUtilisateur(utilisateurId) {
    const portefeuille = await walletRepository.findByUtilisateurId(utilisateurId);
    if (!portefeuille) {
      throw new Error("Impossible de charger le dashboard : portefeuille introuvable.");
    }

    const statsMetriques = await dashboardRepository.obtenirDonneesMiniDashboard(portefeuille.id);

    return {
      portefeuille: {
        id: portefeuille.id,
        soldeActuel: parseFloat(portefeuille.solde),
        deviseLocale: portefeuille.devise,
        statut: portefeuille.statut
      },
      fluxRegulateur: {
        totalDepensesMois: statsMetriques.totalDepensesMoisEnCours
      },
      historiqueRecent: statsMetriques.dernieresTransactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        montant: parseFloat(tx.montant),
        frais: parseFloat(tx.frais || 0),
        statut: tx.statut,
        reference: tx.referenceMarchand,
        description: tx.description,
        operateur: tx.agregateur ? tx.agregateur.nom : 'UniPay Internal',
        date: tx.dateCreation
      }))
    };
  }

  /**
   * Construit le rapport financier consolidé pour les administrateurs
   */
  async genererRapportFinancierAdmin() {
    const metrics = await dashboardRepository.obtenirMetriquesGlobalesAdmin();
    
    // Formatage des données par pays pour faciliter l'affichage en graphiques circulaires (Pie Charts)
    const rapportsGeographiques = metrics.analyseGeographique.map(item => ({
      pays: item.paysOperation,
      typeOperation: item.type,
      volumeFinancier: item._sum.montant || 0,
      nombreTransactions: item._count.id || 0
    }));

    return {
      horodatageRapport: new Date(),
      indicateursCles: {
        gtv: metrics.volumeTotalFinancier, // Indicateur clé de croissance pour les investisseurs
        volumeTransactions: metrics.nombreTransactionsReussies,
        chiffreAffairesBrut: metrics.totalFraisFactures,
        beneficeNetSpread: metrics.margeNetteUniPay
      },
      performancesRegionales: rapportsGeographiques
    };
  }
}

module.exports = new DashboardService();