const prisma = require('../../../database/prisma');

class EpargneRepository {
  
  // 📝 CRÉATION D'UN OBJECTIF
  // Le paramètre "donnees" recevra proprement : libelle, montantCible, type, sousType, etc.
  async creerObjectif(donnees) {
    return await prisma.objectifEpargne.create({
      data: donnees
    });
  }

  // 🔍 TROUVER UN OBJECTIF PAR SON ID
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

  // 📋 LISTER LES OBJECTIFS EN COURS ET ATTEINTS (Non encore vidés / liquidés)
  async listerObjectifsActifs(portefeuilleId) {
    return await prisma.objectifEpargne.findMany({
      where: { 
        portefeuilleId,
        statut: {
          in: ["EN_COURS", "ATTEINT"] // 💡 Crucial : Permet de voir l'épargne même si la jauge est pleine pour pouvoir la liquider !
        }
      },
      orderBy: {
        // Optionnel : affiche les plus récents en premier
        id: 'desc'
      }
    });
  }

  // 🤖 HISTORIQUE / CRON : Lister toutes les épargnes intelligentes actives avec auto-prélèvement activé
  async listerEpargnesIntelligentesAAlimenter() {
    return await prisma.objectifEpargne.findMany({
        where: {
            type: "INTELLIGENTE",
            statut: "EN_COURS",
            autoPrelevement: true
        },
        include: {
            portefeuille: true,
            // utilisateur: true 
        }
    });
}
}

module.exports = new EpargneRepository();