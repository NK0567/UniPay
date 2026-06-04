const logger = require('../../../utils/logger');

class OrangeService {
  async encaisserDepot(telephone, montant, referenceUniPay) {
    logger.info(`[ORANGE MM] Appel de dépôt simulé vers ${telephone} pour ${montant} XAF (${referenceUniPay}).`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (telephone.endsWith('99')) {
      return {
        statutOperateur: 'ECHEC',
        motif: 'SOLDE_MOBILE_INSUFFISANT',
        transactionIdFournisseur: `ORNG_ERR_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
    }

    return {
      statutOperateur: 'SUCCES',
      transactionIdFournisseur: `ORNG_TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  async envoyerRetrait(telephone, montant, referenceUniPay) {
    logger.info(`[ORANGE MM] Appel de retrait simulé vers ${telephone} pour ${montant} XAF (${referenceUniPay}).`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      statutOperateur: 'SUCCES',
      transactionIdFournisseur: `ORNG_WIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }
}

module.exports = new OrangeService();
