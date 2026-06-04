const utilisateurService = require('../services/user.service');

class UtilisateurController {
  /**
   * GET /api/v1/utilisateurs/me
   * Récupère le profil de l'utilisateur actuellement connecté (Token JWT)
   */
  async getMonProfil(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const profil = await utilisateurService.obtenirProfilUtilisateur(utilisateurId);

      return res.status(200).json({
        success: true,
        data: profil
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/utilisateurs/me
   * Permet à l'utilisateur de modifier ses informations depuis l'application Flutter
   */
  async updateMonProfil(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const { nom, prenom, email } = req.body;

      const profilModifie = await utilisateurService.mettreAJourProfil(utilisateurId, { nom, prenom, email });

      return res.status(200).json({
        success: true,
        message: "Votre profil a été mis à jour avec succès.",
        data: profilModifie
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/utilisateurs/admin/valider-kyc
   * Route administrative pour valider les pièces d'identité
   */
  async validerKycClient(req, res, next) {
    try {
      const responsableId = req.user.id; // ID de l'Admin ou de l'Agent Humanitaire (MORA)
      const { utilisateurId, niveauKyc } = req.body;

      const resultat = await utilisateurService.approuverKycUtilisateur(utilisateurId, niveauKyc, responsableId);

      return res.status(200).json({
        success: true,
        data: resultat
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UtilisateurController();