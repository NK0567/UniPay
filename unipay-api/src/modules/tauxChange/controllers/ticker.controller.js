const tickerService = require('../services/ticker.service');

class TickerController {
  /**
   * GET /api/v1/taux-change/ticker-dashboard
   */
  async obtenirTickerDashboard(req, res, next) {
    try {
      const utilisateurId = req.user.id; // Récupéré via le token JWT de l'utilisateur connecté

      const donnéesTicker = await tickerService.obtenirConversionsTicker(utilisateurId);

      return res.status(200).json({
        success: true,
        message: "Données du ticker de devises générées avec succès.",
        data: donnéesTicker
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TickerController();