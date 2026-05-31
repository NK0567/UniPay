const securiteService = require('../services/securite.service');

class SecuriteController {
  /**
   * POST /api/v1/securite/debloquer-wallet
   * Réservé exclusivement aux administrateurs
   */
  async debloquerCompte(req, res, next) {
    try {
      const adminId = req.user.id; // L'admin connecté
      const { walletId, justification } = req.body;

      if (!walletId || !justification) {
        return res.status(400).json({
          success: false,
          error: "Le walletId et une justification écrite sont obligatoires pour cette opération d'audit."
        });
      }

      const resultat = await securiteService.leverBlocageManuel(walletId, adminId, justification);

      return res.status(200).json({
        success: true,
        data: resultat
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SecuriteController();