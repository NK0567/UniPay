const prisma = require('../../../database/prisma');

class RapportRepository {
  /**
   * Extrait toutes les transactions réussies entre deux dates pour l'audit
   */
  async extraireTransactionsPourPeriode(dateDebut, dateFin) {
    return await prisma.transaction.findMany({
      where: {
        statut: "SUCCES",
        dateCreation: {
          gte: new Date(dateDebut),
          lte: new Date(dateFin)
        }
      },
      include: {
        walletSource: {
          select: { devise: true }
        }
      },
      orderBy: { dateCreation: 'asc' }
    });
  }
}

module.exports = new RapportRepository();