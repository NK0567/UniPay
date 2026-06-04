const prisma = require('../../../database/prisma');

class AnalyseFluxService {

  async analyserCapaciteEpargne(utilisateurId) {
    // 1. 📅 CALCULER LA DATE LIMITE (Aujourd'hui - 3 mois)
    const dateLimite = new Date();
    dateLimite.setMonth(dateLimite.getMonth() - 3); // Recule l'horloge de pile 3 mois

    // 2. ⚡ REQUÊTE PRISMA CIBLÉE ET OPTIMISÉE
    // On ne récupère que l'historique nécessaire, et UNIQUEMENT le champ 'montant' pour économiser la RAM
    const transactionsEntrantes = await prisma.transaction.findMany({
      where: {
        destinataireId: utilisateurId,
        statut: 'SUCCES',
        createdAt: {
          gte: dateLimite // Supérieur ou égal à (Aujourd'hui - 3 mois)
        }
      },
      select: { montant: true } // Performance : Évite de charger les chaînes de caractères inutiles, ID, etc.
    });

    const transactionsSortantes = await prisma.transaction.findMany({
      where: {
        expediteurId: utilisateurId,
        statut: 'SUCCES',
        createdAt: {
          gte: dateLimite
        }
      },
      select: { montant: true }
    });

    // 3. 🧮 CALCUL DES REVENUS ET DÉPENSES SUR CETTE PÉRIODE
    const totalEntrant = transactionsEntrantes.reduce((sum, tx) => sum + Number(tx.montant), 0);
    const totalSortant = transactionsSortantes.reduce((sum, tx) => sum + Number(tx.montant), 0);

    // 4. 🧠 CALCUL DE LA CAPACITÉ MENSUELLE MOYENNE
    // Comme on a cumulé 3 mois de flux, on divise le reste par 3 pour obtenir la moyenne par mois
    const resteTroisMois = totalEntrant - totalSortant;
    const capaciteMensuelleMoyenne = resteTroisMois > 0 ? (resteTroisMois / 3) : 0;

    // 🎯 PROPOSITION DU POURCENTAGE D'ÉPARGNE (Basé sur le profil mensuel)
    let pourcentage = 0.05; // 5% par défaut
    if (capaciteMensuelleMoyenne > 500000) {
      pourcentage = 0.20; // Profil investisseur (20%)
    } else if (capaciteMensuelleMoyenne > 200000) {
      pourcentage = 0.10; // Profil modéré (10%)
    }

    // Le montant que le système va prélever automatiquement chaque mois
    const montantPrelevementMensuel = parseFloat((capaciteMensuelleMoyenne * pourcentage).toFixed(2));

    return {
      periodeAnalyse: "90 jours",
      totalEntrantSur3Mois: totalEntrant,
      totalSortantSur3Mois: totalSortant,
      capaciteMensuelleMoyenne,
      pourcentagePropose: pourcentage,
      montantPrelevement: montantPrelevementMensuel
    };
  }
}

module.exports = new AnalyseFluxService();