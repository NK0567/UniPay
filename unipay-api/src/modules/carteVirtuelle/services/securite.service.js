const crypto = require('crypto');

// Clé secrète de chiffrement (À mettre dans ton fichier .env à terme)
const ENCRYPTION_KEY = process.env.CARD_ENCRYPTION_KEY ; 
const IV_LENGTH = 16;

class SecuriteService {

  // 🔐 CHIFFREMENT DU NUMÉRO DE CARTE (Réversible pour pouvoir l'afficher au client s'il le demande)
  chiffrerPAN(pan) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let encrypted = cipher.update(pan);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    // On stocke l'IV et le texte chiffré ensemble au format hex
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  // 🔓 DÉCHIFFREMENT DU NUMÉRO DE CARTE (Quand le client clique sur "Voir le numéro")
  dechiffrerPAN(texteChiffre) {
    const parties = texteChiffre.split(':');
    const iv = Buffer.from(parties.shift(), 'hex');
    const texteEncrypte = Buffer.from(parties.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
    let decrypted = decipher.update(texteEncrypte);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // 🤫 HASHAGE DU CVV (Non réversible pour une sécurité maximale)
  hasherCVV(cvv) {
    return crypto.createHash('sha256').update(cvv).toString('hex');
  }
}

module.exports = new SecuriteService();