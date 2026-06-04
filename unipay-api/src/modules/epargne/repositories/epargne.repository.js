const prisma = require('../../../database/prisma');

class EpargneRepository {
  
  async creerObjectif(donnees) {
    return await prisma.objectifEpargne.create({
      data: donnees
    });
  }

  async trouverObjectifParId(id, portefeuilleId) {
    return await prisma.objectifEpargne.findFirst({
      where: { id, portefeuilleId },
      include: {
        portefeuille: {
          include: { utilisateur: true }
        }
      }
    });
  }

  async listerObjectifsActifs(portefeuilleId) {
    return await prisma.objectifEpargne.findMany({
      where: { 
        portefeuilleId,
        statut: { in: ["EN_COURS", "ATTEINT"] }
      },
      orderBy: { id: 'desc' }
    });
  }

  async listerEpargnesIntelligentesAAlimenter() {
    return await prisma.objectifEpargne.findMany({
      where: {
        type: "INTELLIGENTE",
        statut: "EN_COURS",
        autoPrelevement: true
      },
      include: {
        portefeuille: true
      }
    });
  }
}

module.exports = new EpargneRepository();