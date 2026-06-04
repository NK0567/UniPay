const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * 🔧 REFACTORING: Utilitaire de Token Consolidé
 * 
 * Gère tous les aspects des tokens:
 * - JWT (access tokens de session)
 * - Tokens opaques (reset password, email verification)
 * - Verification et extraction de tokens
 */
const TokenUtil = {
  /**
   * Génère un JSON Web Token de session valable 24 heures
   * 🔧 REFACTORING: Renommé de genererAcessToken → genererAccessToken (typo corrigée)
   * @param {string} userId - ID de l'utilisateur
   * @param {string} role - Rôle de l'utilisateur (USER, ADMIN, etc)
   * @returns {string} JWT encodé
   * @throws {Error} Si JWT_SECRET n'est pas configuré
   */
  genererAccessToken(userId, role) {
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
   * DEPRECATED - Ancien nom avec typo, gardé pour compatibilité
   * À remplacer par genererAccessToken()
   */
  genererAcessToken(userId, role) {
    console.warn('⚠️ genererAcessToken() DEPRECATED - Utilisez genererAccessToken()');
    return this.genererAccessToken(userId, role);
  },

  /**
   * Génère un token opaque sécurisé pour la récupération de mot de passe oublié
   * @param {number} validiteHeures - Durée de validité en heures (défaut: 1)
   * @returns {{ tokenBrut: string, expiration: Date }} Token et sa date d'expiration
   */
  genererResetTokenOpaque(validiteHeures = 1) {
    const tokenBrut = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + validiteHeures * 3600000);
    return { tokenBrut, expiration };
  },

  /**
   * Génère un token pour vérification d'email
   * @param {number} validiteHeures - Durée de validité en heures (défaut: 24)
   * @returns {{ tokenBrut: string, expiration: Date }}
   */
  genererEmailVerificationToken(validiteHeures = 24) {
    const tokenBrut = crypto.randomBytes(32).toString('hex');
    const expiration = new Date(Date.now() + validiteHeures * 3600000);
    return { tokenBrut, expiration };
  },

  /**
   * Génère un token de rafraîchissement (refresh token) de longue durée
   * @param {string} userId - ID de l'utilisateur
   * @param {string} role - Rôle de l'utilisateur
   * @returns {string} Refresh token JWT (7 jours de validité)
   */
  genererRefreshToken(userId, role) {
    if (!process.env.JWT_SECRET) {
      throw new Error("La variable d'environnement JWT_SECRET n'est pas configurée.");
    }
    return jwt.sign(
      { id: userId, role, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  /**
   * Vérifie et décode un JWT
   * @param {string} token - JWT à vérifier
   * @returns {Object} Payload du token décodé
   * @throws {Error} Si le token est invalide, expiré ou non configuré
   */
  verifierAccessToken(token) {
    if (!token) {
      throw new Error("Le token est requis.");
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("La variable d'environnement JWT_SECRET n'est pas configurée.");
    }
    
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error("Le token JWT a expiré.");
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error("Le token JWT n'est pas valide.");
      }
      throw error;
    }
  },

  /**
   * Extrait le token JWT du header Authorization
   * Format attendu: "Bearer <token>"
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} Le token ou null si pas trouvé
   */
  extraireTokenDuHeader(authHeader) {
    if (!authHeader) return null;
    
    const parties = authHeader.split(' ');
    if (parties.length === 2 && parties[0].toLowerCase() === 'bearer') {
      return parties[1];
    }
    return null;
  },

  /**
   * Décode un JWT SANS vérifier sa signature (utile pour lire le payload avant vérification)
   * ⚠️ NE PAS FAIRE CONFIANCE AUX DONNÉES sans vérification préalable
   * @param {string} token - JWT à décoder
   * @returns {Object} Payload du token
   */
  decoderSansVerification(token) {
    if (!token) {
      throw new Error("Le token est requis.");
    }
    const decoded = jwt.decode(token);
    if (!decoded) {
      throw new Error("Le token n'est pas un JWT valide.");
    }
    return decoded;
  },

  /**
   * Vérifie si un token opaque est encore valide
   * @param {Date} dateExpiration - Date d'expiration du token
   * @returns {boolean} True si le token est encore valide
   */
  estTokenValide(dateExpiration) {
    return new Date() < dateExpiration;
  }
};

module.exports = TokenUtil;