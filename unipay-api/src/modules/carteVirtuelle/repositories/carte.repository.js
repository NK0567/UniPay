const prisma = require('../../../database/prisma');

class CarteRepository {
  
  // 🔍 Trouver la carte d'un portefeuille
  async trouverParPortefeuilleId(portefeuilleId) {
    return await prisma.carteVirtuelle.findUnique({
      where: { portefeuilleId }
    });
  }

  // 🔍 Trouver une carte par son ID unique
  async trouverParId(id) {
    return await prisma.carteVirtuelle.findUnique({
      where: { id },
      include: { portefeuille: true }
    });
  }

  // 🔍 Trouver une carte par son ID chez le fournisseur externe (utile pour les webhooks)
  async trouverParIdFournisseur(idFournisseur) {
    return await prisma.carteVirtuelle.findUnique({
      where: { idFournisseur }
    });
  }

  // 🆕 Enregistrer la carte en BDD (Dans une transaction Prisma globale initiée par le service)
  async creerCarte(donnees, tx = prisma) {
    return await tx.carteVirtuelle.create({
      data: {
        portefeuilleId: donnees.portefeuilleId,
        idFournisseur: donnees.idFournisseur,
        libelle: donnees.libelle || "Carte Unique UniPay",
        marque: donnees.marque || "VISA",
        numeroMasque: donnees.numeroMasque,
        numeroTokenise: donnees.numeroTokenise,
        cvvHash: donnees.cvvHash,
        dateExpiration: donnees.dateExpiration,
        limitePlafond: donnees.limitePlafond || 500000.00,
        statut: "ACTIVE"
      }
    });
  }

  // 🔄 Mettre à jour le statut ou les limites de la carte
  async mettreAJour(id, donneesMiseAJour) {
    return await prisma.carteVirtuelle.update({
      where: { id },
      data: donneesMiseAJour
    });
  }
}

module.exports = new CarteRepository();