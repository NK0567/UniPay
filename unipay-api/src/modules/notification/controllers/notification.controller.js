const notificationRepository = require('../repositories/notification.repository');

class NotificationController {
  async getMesNotifications(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const liste = await notificationRepository.obtenirNotificationsUtilisateur(utilisateurId);
      
      return res.status(200).json({ success: true, data: liste });
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new NotificationController();