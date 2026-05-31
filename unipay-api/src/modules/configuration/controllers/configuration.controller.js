const configurationService = require('../services/configuration.service');
const configurationRepository = require('../repositories/configuration.repository');

class ConfigurationController {
  /**
   * GET /api/v1/configurations
   * Permet à l'interface d'administration de lister tous les paramètres actuels
   */
  async listerToutes(req, res, next) {
    try {
      const configs = await configurationRepository.obtenirToutes();
      return res.status(200).json({ success: true, data: configs });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/configurations
   * Permet à un administrateur de modifier les règles métiers en temps réel
   */
  async modifierParametre(req, res, next) {
    try {
      const adminId = req.user.id;
      const { cle, valeur, description } = req.body;

      const config = await configurationService.mettreAJourParametre(cle, valeur, description, adminId);
      
      return res.status(200).json({
        success: true,
        message: `La configuration ${cle} a été mise à jour avec succès.`,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConfigurationController();