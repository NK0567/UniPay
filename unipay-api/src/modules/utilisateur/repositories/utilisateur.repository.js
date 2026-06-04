const prisma = require('../../../database/prisma');

class UtilisateurRepository {
  /**
   * Récupère le profil complet d'un utilisateur avec son portefeuille lié
   */
  async trouverParId(id) {
    return await prisma.utilisateur.findUnique({
      where: { id },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        role: true,
        statutKyc: true, // 'NIVEAU_0', 'NIVEAU_1', 'NIVEAU_2'
        estActif: true,
        dateCreation: true,
        portefeuille: {
          select: {
            id: true,
            solde: true,
            devise: true,
            statut: true
          }
        }
      }
    });
  }

  /**
   * Met à jour les informations basiques du profil
   */
  async modifierProfil(id, donneesMiseAJour) {
    return await prisma.utilisateur.update({
      where: { id },
      data: {
        nom: donneesMiseAJour.nom,
        prenom: donneesMiseAJour.prenom,
        email: donneesMiseAJour.email
      }
    });
  }

  /**
   * Valide le niveau de conformité (KYC) d'un utilisateur (Action Admin/Agent)
   */
  async modifierStatutKyc(id, nouveauNiveau) {
    return await prisma.utilisateur.update({
      where: { id },
      data: { statutKyc: nouveauNiveau }
    });
  }
}

module.exports = new UtilisateurRepository();