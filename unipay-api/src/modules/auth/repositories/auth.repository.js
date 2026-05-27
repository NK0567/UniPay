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
}

module.exports = new AuthRepository();