const prisma = require('../../../database/prisma');

class AuthRepository {
  async trouverParEmailOuTelephone(identifiant) {
    return await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email: identifiant },
          { telephone: identifiant }
        ]
      }
    });
  }

  async trouverParResetToken(token) {
    return await prisma.utilisateur.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });
  }

  async creerUtilisateurEtPortefeuille(dto, codePays) {
    return await prisma.$transaction(async (tx) => {
      const util = await tx.utilisateur.create({
        data: {
          nom: dto.nom,
          prenom: dto.prenom,
          email: dto.email,
          telephone: dto.telephone,
          motDePasse: dto.motDePasse,
          pays: codePays,
          role: 'USER'
        }
      });
      await tx.portefeuille.create({
        data: { 
            utilisateurId: util.id, 
            solde: 0.0, 
            soldeBloque: 0.0 }
      });
      return util;
    });
  }

  async mettreAJourChampsReset(userId, token, expiration) {
    return await prisma.utilisateur.update({
      where: { id: userId },
      data: { 
        resetToken: token, 
        resetTokenExpires: expiration }
    });
  }

  async reinitialiserMotDePasse(userId, motDePasseHache) {
    return await prisma.utilisateur.update({
      where: { id: userId },
      data: {
        motDePasse: motDePasseHache,
        resetToken: null,
        resetTokenExpires: null
      }
    });
  }

  /**
   * 🔍 Trouver un utilisateur par son ID pour vérifier l'état de son PIN
   */
  async trouverParId(id) {
    return await prisma.utilisateur.findUnique({
      where: { id },
      include: { portefeuille: true } // Optionnel : si besoin de lier le portefeuille
    });
  }

  /**
   * 💾 Mettre à jour le code PIN hashé en base de données
   */
  async mettreAJourPin(utilisateurId, pinHashe) {
    return await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { codePIN: pinHashe }
    });
  }
}

module.exports = new AuthRepository();