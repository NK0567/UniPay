const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const TokenUtil = {
  /**
   * Génère un JSON Web Token de session valable 24 heures
   * @param {string} userId 
   * @param {string} role 
   * @returns {string}
   */
  genererAcessToken(userId, role) {
    if (!process.env.JWT_SECRET) {
      throw new Error("La variable d'environnement JWT_SECRET n'est pas configurée.");
    }
    return jwt.sign(
      { id: userId, role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
  },

  /**
   * Génère un token opaque sécurisé pour la récupération de mot de passe oublié
   * @returns {{ tokenBrut: string, expiration: Date }}
   */
  genererResetTokenOpaque() {
    const tokenBrut = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + 3600000); // 1 heure de validité
    return { tokenBrut, expiration };
  }
};

module.exports = TokenUtil;