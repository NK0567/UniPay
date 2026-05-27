const crypto = require('crypto');

const CryptoUtil = {
    calculerSignatureLien(token, utilisateurId) {
        const secret = process.env.JWT_SECRET || 'unipay_secret_key_2026';
        // On signe en combinant le token unique du lien et l'ID de l'utilisateur
        const donnees = `${token}:${utilisateurId}`;
        
        return crypto
        .createHmac('sha256', secret)
        .update(donnees)
        .digest('hex');
    },

    verifierSignatureLien(token, utilisateurId, signatureFournie) {
        const signatureAttendue = this.calculerSignatureLien(token, utilisateurId);
        return crypto.timingSafeEqual(
            Buffer.from(signatureFournie, 'utf-8'),
            Buffer.from(signatureAttendue, 'utf-8')
        );
    }
};

module.exports = CryptoUtil;