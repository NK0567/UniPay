const prisma = require('../../../database/prisma');
const AppError = require('../../../utils/app-error');

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

  async trouverParId(id) {
    return await prisma.utilisateur.findUnique({
      where: { id }
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

  async creerUtilisateurEtPortefeuille(dto, codePays, devise) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Création de l'utilisateur
      const util = await tx.utilisateur.create({
        data: {
          nom: dto.nom,
          prenom: dto.prenom,
          email: dto.email,
          telephone: dto.telephone,
          motDePasse: dto.motDePasse,
          pays: codePays,
          role: 'USER' // Aligné sur ton architecture
        }
      });

      // 2. Création de son unique portefeuille avec la devise détectée
      await tx.portefeuille.create({
        data: { 
          utilisateurId: util.id, 
          solde: 0.0, 
          soldeBloque: 0.0,
          devise: devise // 🔥 Injecté dynamiquement depuis le currencyHelper
        }
      });

      return util;
    });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError("Un compte UniPay existe déjà avec cet email ou ce numéro de téléphone.", 400);
    }
    throw error;
  }
}

  async mettreAJourChampsReset(userId, token, expiration) {
    return await prisma.utilisateur.update({
      where: { id: userId },
      data: { 
        resetToken: token, 
        resetTokenExpires: expiration 
      }
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

  async mettreAJourPin(utilisateurId, pinHashe) {
    return await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { codePIN: pinHashe }
    });
  }
}

module.exports = new AuthRepository();