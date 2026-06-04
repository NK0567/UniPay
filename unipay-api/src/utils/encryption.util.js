/**
 * 🔧 REFACTORING: Utilitaire d'Encryption Consolidé
 * Fusionne l'ancien "encryption.helper.js" (vide) avec "crypto.util.js"
 * 
 * Fournit toutes les fonctions de chiffrement et signature en un seul endroit
 */

const crypto = require('crypto');

const EncryptionUtil = {
  /**
   * Calcule la signature HMAC d'un lien de paiement
   * Combine le token unique et l'ID utilisateur pour créer une signature sécurisée
   * @param {string} token - Token unique du lien
   * @param {string} utilisateurId - ID de l'utilisateur
   * @returns {string} Signature HMAC en hexadécimal
   */
  calculerSignatureLien(token, utilisateurId) {
    const secret = process.env.JWT_SECRET || 'unipay_secret_key_2026';
    const donnees = `${token}:${utilisateurId}`;
    
    return crypto
      .createHmac('sha256', secret)
      .update(donnees)
      .digest('hex');
  },

  /**
   * Vérifie qu'une signature HMAC est valide (résistant aux timing attacks)
   * @param {string} token - Token unique du lien
   * @param {string} utilisateurId - ID de l'utilisateur
   * @param {string} signatureFournie - Signature à vérifier
   * @returns {boolean} True si la signature est valide, False sinon
   */
  verifierSignatureLien(token, utilisateurId, signatureFournie) {
    try {
      const signatureAttendue = this.calculerSignatureLien(token, utilisateurId);
      return crypto.timingSafeEqual(
        Buffer.from(signatureFournie, 'utf-8'),
        Buffer.from(signatureAttendue, 'utf-8')
      );
    } catch (error) {
      // timingSafeEqual lance une erreur si les buffers ne font pas la même taille
      return false;
    }
  },

  /**
   * Génère un hash SHA-256 simple d'une chaîne (pour données non sensibles)
   * @param {string} donnees - Les données à hasher
   * @returns {string} Hash SHA-256 en hexadécimal
   */
  hashSHA256(donnees) {
    return crypto
      .createHash('sha256')
      .update(donnees)
      .digest('hex');
  },

  /**
   * Génère un token aléatoire sécurisé (pour reset password, email verification, etc)
   * @param {number} longueur - Longueur en bytes (défaut: 32, = 64 chars hex)
   * @returns {string} Token aléatoire en hexadécimal
   */
  genererTokenSecurise(longueur = 32) {
    return crypto.randomBytes(longueur).toString('hex');
  },

  /**
   * Chiffre une chaîne en utilisant AES-256-CBC
   * ⚠️ À utiliser pour données sensibles (PAN carte, CVV, etc)
   * @param {string} texte - Le texte à chiffrer
   * @param {string} cle - Clé d'encryption (32 bytes pour AES-256)
   * @returns {string} Format: "iv:ciphertext" en base64
   */
  chiffrerAES256(texte, cle) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(cle, 'utf-8').slice(0, 32), // Assure 32 bytes
      iv
    );

    let encrypted = cipher.update(texte, 'utf-8', 'base64');
    encrypted += cipher.final('base64');

    // Retourner IV + chiffré pour pouvoir déchiffrer plus tard
    return `${iv.toString('base64')}:${encrypted}`;
  },

  /**
   * Déchiffre une chaîne chiffrée en AES-256-CBC
   * @param {string} donnees - Format: "iv:ciphertext" en base64
   * @param {string} cle - Même clé utilisée pour le chiffrement
   * @returns {string} Texte en clair
   */
  dechiffrerAES256(donnees, cle) {
    const [ivBase64, encrypted] = donnees.split(':');
    const iv = Buffer.from(ivBase64, 'base64');

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(cle, 'utf-8').slice(0, 32),
      iv
    );

    let decrypted = decipher.update(encrypted, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }
};

module.exports = EncryptionUtil;
