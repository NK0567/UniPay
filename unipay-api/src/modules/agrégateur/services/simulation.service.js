const logger = require('../../../utils/logger');

class SimulationService {
  /**
   * Simule un appel de Dépôt (Cash-In) vers un opérateur Mobile Money
   */
  async encaisserDepot(telephone, montant, referenceUniPay) {
    logger.info(`[SIMULATION MM] Demande de débit push initiée vers ${telephone} pour un montant de ${montant} XAF.`);

    // Simulation de l'attente réseau d'un callback opérateur (ex: 1.5 seconde)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Scénarios de tests basés sur les derniers chiffres du numéro de téléphone
    if (telephone.endsWith("99")) {
      return {
        statutOperateur: "ECHEC",
        motif: "SOLDE_MOBILE_INSUFFISANT",
        transactionIdFournisseur: `SIM_ERR_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
    }

    if (telephone.endsWith("00")) {
      return {
        statutOperateur: "ECHEC",
        motif: "CODE_PIN_INCORRECT_OU_TIMEOUT",
        transactionIdFournisseur: `SIM_ERR_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      };
    }

    // Scénario nominal : Succès
    return {
      statutOperateur: "SUCCES",
      transactionIdFournisseur: `SIM_REQ_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  /**
   * Simule un virement de Retrait (Cash-Out) vers le compte Mobile Money d'un client
   */
  async envoyerRetrait(telephone, montant, referenceUniPay) {
    logger.info(`[SIMULATION MM] Ordre de transfert (Retrait) vers le compte bénéficiaire ${telephone} de ${montant} XAF.`);
    
    await new Promise(resolve => setTimeout(resolve, 1200));

    return {
      statutOperateur: "SUCCES",
      transactionIdFournisseur: `SIM_WIT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }
}

module.exports = new SimulationService();