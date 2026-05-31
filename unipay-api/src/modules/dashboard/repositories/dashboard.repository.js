const prisma = require('../../../database/prisma');

class DashboardRepository {
  /**
   * 📊 STATS UTILISATEUR : Données rapides pour l'application Flutter
   */
  async obtenirDonneesMiniDashboard(walletId) {
    // Récupération des 5 dernières transactions pour l'historique rapide
    const dernieresTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { walletSourceId: walletId },
          { destination: walletId } // Cas où il est le receveur via son ID wallet
        ]
      },
      orderBy: { dateCreation: 'desc' },
      take: 5,
      include: { agregateur: { select: { nom: true, logo: true } } }
    });

    // Agrégation des volumes de dépenses de l'utilisateur sur le mois en cours
    const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const sommationDepenses = await prisma.transaction.aggregate({
      where: {
        walletSourceId: walletId,
        statut: "SUCCES",
        type: "RETRAIT",
        dateCreation: { gte: debutMois }
      },
      _sum: { montant: true }
    });

    return {
      dernieresTransactions,
      totalDepensesMoisEnCours: sommationDepenses._sum.montant || 0
    };
  }

  /**
   * 🏛️ STATS ADMIN (RAPPORT) : Vue globale et analytique de la Fintech UniPay
   */
  async obtenirMetriquesGlobalesAdmin() {
    // 1. Volume Total des Transactions (GTV - Gross Transaction Volume)
    const gtvGlobal = await prisma.transaction.aggregate({
      where: { statut: "SUCCES" },
      _sum: { montant: true },
      _count: { id: true }
    });

    // 2. Total des gains accumulés (Spread de change + Commissions Smart Routing)
    const gainsComptables = await prisma.transaction.aggregate({
      where: { statut: "SUCCES" },
      _sum: {
        frais: true,       // Frais bruts facturés au client
        gainSpread: true   // Marge nette UniPay
      }
    });

    // 3. Répartition des transactions réussies par pays pour le rapport d'activité
    const repartitionParPays = await prisma.transaction.groupBy({
      by: ['paysOperation', 'type'],
      where: { statut: "SUCCES" },
      _sum: { montant: true },
      _count: { id: true }
    });

    return {
      volumeTotalFinancier: gtvGlobal._sum.montant || 0,
      nombreTransactionsReussies: gtvGlobal._count.id || 0,
      totalFraisFactures: gainsComptables._sum.frais || 0,
      margeNetteUniPay: gainsComptables._sum.gainSpread || 0,
      analyseGeographique: repartitionParPays
    };
  }
}

module.exports = new DashboardRepository();