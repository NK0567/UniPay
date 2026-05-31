const jwt = require('jsonwebtoken');
const env = require('./env');

class JwtConfig {
  /**
   * Génère un Token signé contenant l'ID et le Rôle de l'utilisateur
   */
  genererToken(payload) {
    return jwt.sign(
      { id: payload.id, role: payload.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiration }
    );
  }

  /**
   * Décode et vérifie l'authenticité d'un token reçu
   */
  verifierToken(token) {
    try {
      return jwt.verify(token, env.jwt.secret);
    } catch (error) {
      throw new Error("Jeton de sécurité invalide ou expiré.");
    }
  }
}

module.exports = new JwtConfig();