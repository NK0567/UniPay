
const whatsappService = require('../services/whatsapp.service');

class WhatsappController {
  /**
   * Étape obligatoire pour Meta : Validation du Webhook
   */
  async verifierWebhook(req, res) {
    // Ce token sera défini dans ton fichier .env plus tard (ex: UNIPAY_WHATSAPP_VERIFY_TOKEN)
    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "UNIPAY_SECRET_TOKEN_2026";

    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log("✅ Webhook WhatsApp validé par Meta !");
        return res.status(200).send(challenge);
      } else {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(400);
  }

  /**
   * Réception des payloads de messages de Meta
   */
  async recevoirMessage(req, res) {
    try {
      const { body } = req;

      // On s'assure que le payload vient bien d'un événement WhatsApp valide
      if (body.object === 'whatsapp_business_account' && body.entry) {
        const whatsappService = require('../services/whatsapp.service');
        
        // Meta envoie les événements dans des tableaux imbriqués (entries -> changes -> value)
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              for (const message of change.value.messages) {
                // On ne traite pour l'instant que les messages de type texte
                if (message.type === 'text') {
                  const telephoneExpediteur = message.from; // Ex: "237690000000"
                  const texteMessage = message.text.body;   // Ex: "Solde"
                  
                  // On pousse l'analyse au service de façon asynchrone pour ne pas bloquer Meta
                  whatsappService.analyserEtTraiterMessage(telephoneExpediteur, texteMessage)
                    .catch(err => console.error("❌ Erreur traitement message bot:", err.message));
                }
              }
            }
          }
        }
        // Toujours répondre 200 OK très vite à Meta pour éviter qu'ils renvoient le même message
        return res.status(200).json({ success: true });
      }

      return res.sendStatus(404);
    } catch (error) {
      console.error("❌ Erreur Webhook Réception:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = new WhatsappController();