const logger = require('../../../utils/logger');

class StripeService {
  async encaisserDepot(telephone, montant, referenceUniPay) {
    logger.info(`[STRIPE] Simulation depot vers ${telephone} pour ${montant} XAF (${referenceUniPay}).`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      statutOperateur: 'SUCCES',
      transactionIdFournisseur: `STRP_TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  async envoyerRetrait(telephone, montant, referenceUniPay) {
    logger.info(`[STRIPE] Simulation retrait vers ${telephone} pour ${montant} XAF (${referenceUniPay}).`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      statutOperateur: 'SUCCES',
      transactionIdFournisseur: `STRP_WIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }
}

module.exports = new StripeService();
