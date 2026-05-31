const notificationEventEmitter = require('../../../events/notification.event');
const notificationService = require('../services/notification.service');

function initialiserListenersNotification() {
  
  // 1. Écouter les succès de transaction
  notificationEventEmitter.on('transaction.succes', async (donnees) => {
    const { utilisateurId, telephone, montant, devise, type } = donnees;
    const message = `UniPay: Votre ${type.toLowerCase()} de ${montant} ${devise} a été exécuté avec succès. Merci pour votre confiance !`;
    
    await notificationService.envoyerSMS(utilisateurId, telephone, message);
  });

  // 2. Écouter les alertes critiques de sécurité (codées à l'étape précédente)
  notificationEventEmitter.on('alerte.securite', async (donnees) => {
    const { utilisateurId, email, telephone, motif } = donnees;
    const messageAlerte = `🚨 ALERTE UNIPAY: Votre compte a été temporairement verrouillé. Motif: ${motif}. Si vous n'êtes pas à l'origine de cette tentative, contactez immédiatement le support.`;
    
    if (telephone) await notificationService.envoyerSMS(utilisateurId, telephone, messageAlerte);
    if (email) await notificationService.envoyerEmail(utilisateurId, email, "Sécurité UniPay - Compte Bloqué", messageAlerte);
  });
}

module.exports = initialiserListenersNotification;