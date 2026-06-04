// 🔧 REFACTORING: Import du ConversionService centralisé
const conversionService = require('../services/conversion.service');

class TauxChangeController {
  /**
   * GET /api/v1/taux-change/simuler?montant=100&source=USD&cible=XAF
   */
  async simulerConversion(req, res, next) {
    try {
      const { montant, source, cible } = req.query;

      if (!montant || !source || !cible) {
        return res.status(400).json({
          success: false,
          error: "Veuillez fournir le montant, la devise source et la devise cible."
        });
      }

      const calcul = await conversionService.calculerConversionDynamique(
        parseFloat(montant),
        source,
        cible
      );

      return res.status(200).json({
        success: true,
        data: {
          montantSaisi: parseFloat(montant),
          deviseSource: source.toUpperCase(),
          deviseCible: cible.toUpperCase(),
          // 🔧 REFACTORING: Normalisation du nom de propriété (tauxAppliqueAuClient → tauxApplique)
          tauxApplique: calcul.tauxApplique,
          montantConverti: calcul.montantConverti
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TauxChangeController();