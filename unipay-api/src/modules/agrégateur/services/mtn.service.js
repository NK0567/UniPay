const logger = require('../../../utils/logger');

class MtnService {
  async encaisserDepot(telephone, montant, referenceUniPay) {
    logger.info(`[MTN MM] Appel de dépôt simulé vers ${telephone} pour ${montant} XAF (${referenceUniPay}).`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (telephone.endsWith('98')) {
      return {
        statutOperateur: 'ECHEC',
        motif: 'SERVICE_INDISPONIBLE',
        transactionIdFournisseur: `MTN_ERR_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
    }

    return {
      statutOperateur: 'SUCCES',
      transactionIdFournisseur: `MTN_TX_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  async envoyerRetrait(telephone, montant, referenceUniPay) {
    logger.info(`[MTN MM] Appel de retrait simulé vers ${telephone} pour ${montant} XAF (${referenceUniPay}).`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      statutOperateur: 'SUCCES',
      transactionIdFournisseur: `MTN_WIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }
}

module.exports = new MtnService();
