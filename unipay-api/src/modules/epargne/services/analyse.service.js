const prisma = require('../../../database/prisma');

class AnalyseFluxService {

    async analyserCapaciteEpargne(utilisateurId) {

        // On récupère les transactions entrantes des 3 derniers mois
        const transactionsEntrantes = await prisma.transaction.findMany({
            where: {
                destinataireId: utilisateurId,
                statut: 'SUCCES'
            }
        });

        // Transactions sortantes
        const transactionsSortantes = await prisma.transaction.findMany({
            where: {
                expediteurId: utilisateurId,
                statut: 'SUCCES'
            }
        });

        // Revenus moyens
        const totalEntrant = transactionsEntrantes.reduce(
            (sum, tx) => sum + Number(tx.montant),
            0
        );

        // Dépenses moyennes
        const totalSortant = transactionsSortantes.reduce(
            (sum, tx) => sum + Number(tx.montant),
            0
        );

        // Capacité réelle
        const reste = totalEntrant - totalSortant;

        // Protection anti-solde négatif
        const capacite = reste > 0 ? reste : 0;

        // Proposition IA
        let pourcentage = 0.05;

        if (capacite > 500000) {
            pourcentage = 0.20;
        } else if (capacite > 200000) {
            pourcentage = 0.10;
        }

        const montantPrelevement = capacite * pourcentage;

        return {
            totalEntrant,
            totalSortant,
            capacite,
            pourcentage,
            montantPrelevement
        };
    }
}

module.exports = new AnalyseFluxService();