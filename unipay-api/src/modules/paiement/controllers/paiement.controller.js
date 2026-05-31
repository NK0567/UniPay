const paiementService = require('../services/paiement.service');

class PaiementController {
  
  /**
   * POST /api/v1/paiement/depot
   */
  async depot(req, res, next) {
    try {
      const utilisateurId = req.user.id; // Injecté par auth.middleware
      const { telephone, montant, paysCode } = req.body;

      // Validation de surface rapide
      if (!telephone || !montant || !paysCode) {
        return res.status(400).json({
          success: false,
          error: "Champs requis manquants : telephone, montant, ou paysCode."
        });
      }

      const resultat = await paiementService.executerDepot(utilisateurId, {
        telephone,
        montant,
        paysCode
      });

      return res.status(201).json({
        success: true,
        message: "Dépôt validé et portefeuille crédité.",
        data: resultat
      });

    } catch (error) {
      next(error); // Routage automatique vers ton error.middleware global
    }
  }

  /**
   * POST /api/v1/paiement/retrait
   */
  async retrait(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const { telephone, montant, paysCode } = req.body;

      if (!telephone || !montant || !paysCode) {
        return res.status(400).json({
          success: false,
          error: "Champs requis manquants : telephone, montant, ou paysCode."
        });
      }

      const resultat = await paiementService.executerRetrait(utilisateurId, {
        telephone,
        montant,
        paysCode
      });

      return res.status(200).json({
        success: true,
        message: "Retrait traité avec succès. Votre compte mobile va être crédité.",
        data: resultat
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PaiementController();