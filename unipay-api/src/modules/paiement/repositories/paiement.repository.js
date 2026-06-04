const prisma = require('../../../database/prisma');

class PaiementRepository {
  // Récupérer les 10 dernières transactions de paiement d'un portefeuille
  async obtenirHistoriquePortefeuille(walletId) {
    return await prisma.transaction.findMany({
      where: {
        OR: [
          { walletSourceId: walletId },
          { destination: walletId }
        ]
      },
      orderBy: { dateCreation: 'desc' },
      take: 10
    });
  }

  // Vérifier si une référence unique existe déjà (anti-fraude / anti-rejeu)
  async existeDeja(referenceMarchand) {
    const transaction = await prisma.transaction.findUnique({
      where: { referenceMarchand }
    });
    return !!transaction;
  }
}

module.exports = new PaiementRepository();