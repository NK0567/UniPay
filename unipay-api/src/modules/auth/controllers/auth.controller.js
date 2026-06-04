const authService = require('../services/auth.service');
const { InscriptionDto, ConnexionDto, PasswordResetDto } = require('../data-transfer-objet/auth.dto');

class AuthController {
  async inscription(req, res, next) {
    try {
      const dto = new InscriptionDto(req.body);
      const output = await authService.inscription(dto);
      return res.status(201).json({ success: true, data: output });
    } catch (e) {
      res.status(400);
      next(e);
    }
  }

  async connexion(req, res, next) {
    try {
      const dto = new ConnexionDto(req.body);
      const output = await authService.connexion(dto);
      return res.status(200).json({ success: true, data: output });
    } catch (e) {
      res.status(401);
      next(e);
    }
  }

  async motDePasseOublie(req, res, next) {
    try {
      const output = await authService.demandeMotDePasseOublie(req.body.email);
      return res.status(200).json({ success: true, data: output });
    } catch (e) {
      res.status(400);
      next(e);
    }
  }

  async recupererMotDePasse(req, res, next) {
    try {
      const dto = new PasswordResetDto(req.body);
      const output = await authService.executerRéinitialisation(dto);
      return res.status(200).json({ success: true, data: output });
    } catch (e) {
      res.status(400);
      next(e);
    }
  }

  async initialiserPin(req, res, next) {
    try {
      const { utilisateurId, nouveauPin } = req.body;
      
      if (!utilisateurId || !nouveauPin) {
        return res.status(400).json({ success: false, error: "Champs manquants." });
      }

      // 🔧 CORRECTION : Appel de authService au lieu de utilisateurService
      const resultat = await authService.configurerPremierPIN(utilisateurId, nouveauPin);
      return res.status(200).json({ success: true, data: resultat });
    } catch (error) {
      res.status(400);
      next(error);
    }
  }

  async changerPin(req, res, next) {
    try {
      const { utilisateurId, ancienPin, nouveauPin } = req.body;

      if (!utilisateurId || !ancienPin || !nouveauPin) {
        return res.status(400).json({ success: false, error: "Tous les champs sont requis." });
      }

      // 🔧 CORRECTION : Appel de authService au lieu de utilisateurService
      const resultat = await authService.modifierPINExistant(utilisateurId, ancienPin, nouveauPin);
      return res.status(200).json({ success: true, data: resultat });
    } catch (error) {
      res.status(400);
      next(error);
    }
  }
}

module.exports = new AuthController();