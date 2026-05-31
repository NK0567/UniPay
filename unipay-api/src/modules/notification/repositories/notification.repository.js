const prisma = require('../../../database/prisma');

class NotificationRepository {
  /**
   * Enregistre l'historique d'une notification en BDD
   */
  async sauvegarderLogNotification(donnees) {
    return await prisma.notificationLog.create({
      data: {
        utilisateurId: donnees.utilisateurId,
        type: donnees.type,         // 'SMS', 'EMAIL', 'PUSH'
        destinataire: donnees.destinataire, // Numéro de téléphone ou email
        message: donnees.message,
        statut: donnees.statut,       // 'SUCCES', 'ECHEC'
        erreurRetournee: donnees.erreur || null
      }
    });
  }

  /**
   * Récupère les notifications récentes d'un utilisateur (pour une boîte de réception in-app)
   */
  async obtenirNotificationsUtilisateur(utilisateurId) {
    return await prisma.notificationLog.findMany({
      where: { utilisateurId },
      orderBy: { dateCreation: 'desc' },
      take: 20
    });
  }
}

module.exports = new NotificationRepository();