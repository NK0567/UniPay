const utilisateurRepository = require('../repositories/utilisateur.repository');

class UtilisateurService {
  /**
   * Récupère les données nettoyées pour le profil de l'application Flutter
   */
  async obtenirProfilUtilisateur(utilisateurId) {
    const utilisateur = await utilisateurRepository.trouverParId(utilisateurId);
    if (!utilisateur) {
      throw new Error("L'utilisateur demandé n'existe pas.");
    }
    if (!utilisateur.estActif) {
      throw new Error("Ce compte UniPay a été suspendu. Veuillez contacter le support.");
    }
    return utilisateur;
  }

  /**
   * Traite la mise à jour du profil de l'utilisateur
   */
  async mettreAJourProfil(utilisateurId, donnees) {
    // Tu peux ajouter des validations ici (ex: format de l'email via regex)
    return await utilisateurRepository.modifierProfil(utilisateurId, donnees);
  }

  /**
   * 🛡️ APPROBATION DE CONFORMITÉ (KYC)
   * Permet de faire passer un utilisateur au niveau supérieur pour débloquer ses plafonds
   */
  async approuverKycUtilisateur(utilisateurId, niveauKyc, responsableId) {
    const niveauxValides = ['NIVEAU_0', 'NIVEAU_1', 'NIVEAU_2'];
    if (!niveauxValides.includes(niveauKyc)) {
      throw new Error("Niveau de conformité KYC invalide.");
    }

    const utilisateurMiseAJour = await utilisateurRepository.modifierStatutKyc(utilisateurId, niveauKyc);

    // Déclencher un log d'audit interne (Important pour la traçabilité de l'Agent/Admin)
    return {
      success: true,
      message: `Le statut de conformité de l'utilisateur a été élevé à ${niveauKyc}.`,
      approuvePar: responsableId,
      utilisateur: utilisateurMiseAJour
    };
  }
}

module.exports = new UtilisateurService();