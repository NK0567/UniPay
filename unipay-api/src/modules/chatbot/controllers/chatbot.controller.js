const chatbotService = require('../services/chatbot.service');

class ChatbotController {
  async recevoirMessage(req, res) {
    try {
      // On récupère l'identifiant de l'utilisateur (injecté par ton middleware d'authentification)
      // et le corps du message envoyé depuis WhatsApp / l'application.
      const utilisateurId = req.user.id; 
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ 
          success: false, 
          error: "Le contenu du message est requis." 
        });
      }

      // Traitement du message par notre orchestrateur de briques UniPay
      const reponseBot = await chatbotService.traiterMessage(utilisateurId, message);

      // Pour WhatsApp, une réponse brute au format texte est souvent idéale
      return res.status(200).send(reponseBot);

    } catch (error) {
      console.error("🚨 Erreur Contrôleur Chatbot :", error);
      return res.status(500).json({ 
        success: false, 
        error: "Une erreur interne est survenue lors du traitement du message." 
      });
    }
  }
}

module.exports = new ChatbotController();