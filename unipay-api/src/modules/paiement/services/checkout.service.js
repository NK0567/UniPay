class CheckoutService {
  async initierSessionPaiement(data) {
    return {
      succes: true,
      message: 'Session de paiement créée (simulée).',
      sessionId: `CHK_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
  }

  async verifierWebhook(payload) {
    return {
      succes: true,
      message: 'Webhook reçu et traité (stub).',
      payload
    };
  }
}

module.exports = new CheckoutService();
