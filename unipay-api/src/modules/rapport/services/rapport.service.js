const rapportRepository = require('../repositories/rapport.repository');

class RapportService {
  /**
   * 📉 COMPTABILITÉ FINANCIÈRE CONSOLIDÉE
   * Calcule les indicateurs clés (KPI) requis pour les rapports financiers
   */
  async compilerRapportComptable(dateDebut, dateFin) {
    const transactions = await rapportRepository.extraireTransactionsPourPeriode(dateDebut, dateFin);

    let gtvGlobal = 0;
    let totalCommissionsFrais = 0;
    let totalGainSpreadChange = 0;
    let volumeParType = { DEPOT: 0, RETRAIT: 0, TRANSFERT: 0 };
    let totalTransactionsNombre = transactions.length;

    // Analyse et ventilation de chaque transaction réussie
    for (const tx of transactions) {
      const montant = parseFloat(tx.montant);
      const frais = parseFloat(tx.frais || 0);
      const spread = parseFloat(tx.gainSpread || 0);

      gtvGlobal += montant;
      totalCommissionsFrais += frais;
      totalGainSpreadChange += spread;

      if (volumeParType[tx.type] !== undefined) {
        volumeParType[tx.type] += montant;
      }
    }

    // Calcul de l'EBITDA / Chiffre d'affaires brut d'UniPay sur la période
    const chiffreAffairesBrut = totalCommissionsFrais + totalGainSpreadChange;

    return {
      periode: { debut: dateDebut, fin: dateFin },
      metriquesGenerales: {
        nombreTransactionsEvaluees: totalTransactionsNombre,
        gtvGlobal: gtvGlobal, // Volume Global des paiements ayant transité
        chiffreAffairesBrut: chiffreAffairesBrut,
        revenuFraisDirects: totalCommissionsFrais,
        revenuMargeChange: totalGainSpreadChange
      },
      ventilationFlux: volumeParType,
      statutRapport: "VALIDE_POUR_AUDIT",
      genereLe: new Date()
    };
  }
}

module.exports = new RapportService();