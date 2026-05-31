const dashboardService = require('../services/dashboard.service');

class DashboardController {
  /**
   * GET /api/v1/dashboard/me
   * Utilisé par l'application Flutter pour dessiner l'écran d'accueil principal
   */
  async getClientDashboard(req, res, next) {
    try {
      const utilisateurId = req.user.id; // Extrait du token JWT
      const dashboardPayload = await dashboardService.genererDashboardUtilisateur(utilisateurId);
      
      return res.status(200).json({
        success: true,
        data: dashboardPayload
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/dashboard/admin/rapport-comptable
   * Restreint aux administrateurs pour les audits et réunions stratégiques
   */
  async getAdminRapportComptable(req, res, next) {
    try {
      const rapport = await dashboardService.genererRapportFinancierAdmin();
      
      return res.status(200).json({
        success: true,
        data: rapport
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();