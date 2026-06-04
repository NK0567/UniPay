class WebhookService {
  async verifierSignature(headers, body) {
    return true;
  }

  async traiterEvenement(event) {
    return {
      succes: true,
      message: '�v�nement webhook carte virtuelle trait� (stub).',
      evenement: event
    };
  }
}

module.exports = new WebhookService();
