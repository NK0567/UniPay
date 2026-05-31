const authService = require('../services/auth.service');
const { InscriptionDto, ConnexionDto, PasswordResetDto } = require('../data-transfer-objet/auth.dto');

class AuthController {
  async inscription(req, res) {
    try {
      const dto = new InscriptionDto(req.body);
      const output = await authService.inscription(dto);
      return res.status(201).json({ 
        success: true, 
        data: output 
    });
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: e.message 
    });
    }
  }

  async connexion(req, res) {
    try {
      const dto = new ConnexionDto(req.body);
      const output = await authService.connexion(dto);
      return res.status(200).json({ 
        success: true, 
        data: output 
      });
    } catch (e) {
      return res.status(401).json({ 
        success: false, 
        error: e.message 
      });
    }
  }

  async motDePasseOublie(req, res) {
    try {
      const output = await authService.demandeMotDePasseOublie(req.body.email);
      return res.status(200).json({ 
        success: true, 
        data: output 
      });
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: e.message 
      });
    }
  }

  async recupererMotDePasse(req, res) {
    try {
      const dto = new PasswordResetDto(req.body);
      const output = await authService.executerRéinitialisation(dto);
      return res.status(200).json({ 
        success: true, 
        data: output 
      });
    } catch (e) {
      return res.status(400).json({ 
        success: false, 
        error: e.message 
      });
    }
  }

  async initialiserPin(req, res) {
    try {
      const { utilisateurId, nouveauPin } = req.body;
      
      if (!utilisateurId || !nouveauPin) {
        return res.status(400).json({ success: false, error: "Champs manquants." });
      }

      const resultat = await utilisateurService.configurerPremierPIN(utilisateurId, nouveauPin);
      return res.status(200).json({ success: true, data: resultat });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  /**
   * Route pour modifier le PIN
   */
  async changerPin(req, res) {
    try {
      const { utilisateurId, ancienPin, nouveauPin } = req.body;

      if (!utilisateurId || !ancienPin || !nouveauPin) {
        return res.status(400).json({ success: false, error: "Tous les champs sont requis." });
      }

      const resultat = await utilisateurService.modifierPINExistant(utilisateurId, ancienPin, nouveauPin);
      return res.status(200).json({ success: true, data: resultat });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }
}

module.exports = new AuthController();