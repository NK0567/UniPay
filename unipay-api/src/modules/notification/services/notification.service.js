const notificationRepository = require('../repositories/notification.repository');
const logger = require('../utils/logger');

class NotificationService {
  /**
   * 📱 ENVOI DE SMS (International)
   */
  async envoyerSMS(utilisateurId, telephone, message) {
    try {
      logger.info(`[NOTIFICATION SMS] Envoi en cours vers ${telephone}...`);
      
      // Ici, tu connecteras ton fournisseur (Twilio, Africa's Talking, etc.)
      // const res = await twilio.messages.create({ body: message, to: telephone });
      
      let statutEnvoi = "SUCCES";

      // Sauvegarde du log en BDD
      await notificationRepository.sauvegarderLogNotification({
        utilisateurId,
        type: "SMS",
        destinataire: telephone,
        message,
        statut: statutEnvoi
      });

    } catch (error) {
      logger.error(`[NOTIFICATION ERROR] Échec envoi SMS à ${telephone}: ${error.message}`);
      await notificationRepository.sauvegarderLogNotification({
        utilisateurId,
        type: "SMS",
        destinataire: telephone,
        message,
        statut: "ECHEC",
        erreur: error.message
      });
    }
  }

  /**
   * 📧 ENVOI D'EMAIL
   */
  async envoyerEmail(utilisateurId, email, sujet, contenu) {
    try {
      logger.info(`[NOTIFICATION EMAIL] Envoi de l'email à ${email}...`);
      
      // Simulation d'envoi réussi
      await notificationRepository.sauvegarderLogNotification({
        utilisateurId,
        type: "EMAIL",
        destinataire: email,
        message: `Sujet: ${sujet} | Contenu: ${contenu}`,
        statut: "SUCCES"
      });
    } catch (error) {
      logger.error(`[NOTIFICATION ERROR] Échec email à ${email}: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();