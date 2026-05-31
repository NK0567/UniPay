const rapportService = require('../services/rapport.service');

class RapportController {
  /**
   * GET /api/v1/dashboard/admin/rapports/generer
   * Extraction d'un rapport comptable complet basé sur une période de temps
   */
  async obtenirRapportFinancier(req, res, next) {
    try {
      // Récupération des filtres de date (par défaut : les 30 derniers jours si non fournis)
      const dateFinDefaut = new Date();
      const dateDebutDefaut = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const dateDebut = req.query.dateDebut || dateDebutDefaut.toISOString();
      const dateFin = req.query.dateFin || dateFinDefaut.toISOString();

      const rapportConsolide = await rapportService.compilerRapportComptable(dateDebut, dateFin);

      return res.status(200).json({
        success: true,
        data: rapportConsolide
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RapportController();