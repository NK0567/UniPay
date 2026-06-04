const paiementService = require('../services/paiement.service');

class PaiementController {
  
  async depot(req, res, next) {
    try {
      const utilisateurId = req.user.id; 
      const { telephone, montant } = req.body; // 💸 Pays détecté par le service de manière transparente

      if (!telephone || !montant) {
        return res.status(400).json({
          success: false,
          error: "Champs requis manquants : telephone ou montant."
        });
      }

      const resultat = await paiementService.executerDepot(utilisateurId, {
        telephone,
        montant
      });

      return res.status(201).json({
        success: true,
        message: "Dépôt validé et portefeuille crédité.",
        data: resultat
      });
    } catch (error) {
      next(error); 
    }
  }

  async retrait(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const { telephone, montant } = req.body;

      if (!telephone || !montant) {
        return res.status(400).json({
          success: false,
          error: "Champs requis manquants : telephone ou montant."
        });
      }

      const resultat = await paiementService.executerRetrait(utilisateurId, {
        telephone,
        montant
      }, req.ip);

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