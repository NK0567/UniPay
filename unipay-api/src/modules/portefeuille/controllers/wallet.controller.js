const walletService = require('../services/wallet.service');

class WalletController {
  // 1. Obtenir le solde
  async getSolde(req, res, next) {
    try {
      const utilisateurId = req.user.id; // Injecté par authMiddleware
      const portefeuille = await walletService.recupererParUtilisateur(utilisateurId);
      
      return res.status(200).json({ success: true, data: portefeuille });
    } catch (error) {
      next(error);
    }
  }
/*
  // 2. Recharger (Créditer)
  async recharger(req, res, next) {
    try {
      const { montant } = req.body;
      const utilisateurId = req.user.id;

      if (!montant) return res.status(400).json({ success: false, error: "Le montant est requis." });

      const wallet = await walletService.crediterCompte(utilisateurId, parseFloat(montant));
      return res.status(200).json({
        success: true,
        message: `Compte rechargé avec succès de ${montant} ${wallet.devise}.`,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }

  // 3. Débiter (Paiement / Retrait)
  async debiter(req, res, next) {
    try {
      const { montant } = req.body;
      const utilisateurId = req.user.id;

      if (!montant) return res.status(400).json({ success: false, error: "Le montant est requis." });

      const wallet = await walletService.debiterCompte(utilisateurId, parseFloat(montant));
      return res.status(200).json({
        success: true,
        message: `Compte débité avec succès de ${montant} ${wallet.devise}.`,
        data: wallet
      });
    } catch (error) {
      next(error);
    }
  }
  */
}

module.exports = new WalletController();