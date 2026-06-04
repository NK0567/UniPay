const prisma = require('../../../database/prisma');

class WalletRepository {
  // Trouver le portefeuille unique d'un utilisateur
  async findByUtilisateurId(utilisateurId) {
    return await prisma.portefeuille.findUnique({
      where: { utilisateurId /*: userId*/ }
    });
  }
/*
 // Mettre à jour les soldes (Générique et réutilisable)
  async updateBalances(userId, { solde, soldeBloque }) {
    return await prisma.portefeuille.update({
      where: { utilisateurId: userId },
      data: {
        ...(solde !== undefined && { solde }),
        ...(soldeBloque !== undefined && { soldeBloque })
      }
    });
  }
  */
}

module.exports = new WalletRepository();