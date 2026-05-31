const crypto = require('crypto');

class ProviderService {
  
  /**
   * Simule la commande d'une carte auprès du partenaire (Stripe / Flutterwave / Bridgecard)
   */
  async commanderNouvelleCarte(nomTitulaire, marque = "VISA") {
    // 1. Simulation d'un ID unique renvoyé par le fournisseur externe
    const idFournisseur = "txt_card_" + crypto.randomBytes(12).toString('hex');
    
    // 2. Génération d'un faux numéro PAN (16 chiffres) commençant par 4 (Visa) ou 5 (Mastercard)
    const prefixe = marque === "VISA" ? "4111" : "5378";
    const resteNumero = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    const pleinNumero = `${prefixe}${resteNumero}`; // Ex: 4111123456789012
    
    // 3. Masquage pour l'affichage public
    const numeroMasque = `${pleinNumero.substring(0, 4)} ${pleinNumero.substring(4, 6)}XX XXXX ${pleinNumero.substring(12)}`;
    
    // 4. Génération du CVV et Date d'expiration (valable 3 ans à partir de maintenant)
    const cvv = Math.floor(100 + Math.random() * 900).toString(); // Ex: 415
    const dateExpiration = new Date();
    dateExpiration.setFullYear(dateExpiration.getFullYear() + 3);

    return {
      idFournisseur,
      numeroMasque,
      pleinNumero, // Ce numéro devra être chiffré avant d'aller en BDD
      cvv,
      dateExpiration
    };
  }
}

module.exports = new ProviderService();