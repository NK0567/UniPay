const carteService = require('../services/carte.service');

class CarteController {

  // 🆕 DEMANDE DE CRÉATION (Avec prélèvement de frais au profit de l'ADMIN)
  async creer(req, res) {
    try {
      // req.user.id est injecté par ton middleware d'authentification JWT
      const carteCreee = await carteService.commanderCarteUnique(req.user.id);

      return res.status(201).json({
        success: true,
        message: "Votre carte unique multifonction a été activée avec succès.",
        data: carteCreee
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // ❄️ ACTION GELER / DÉGELER (Gratuit)
  async gererStatut(req, res) {
    try {
      const { action } = req.body; // Attendu : "GELER" ou "DEGELER"

      if (!['GELER', 'DEGELER'].includes(action)) {
        return res.status(400).json({ success: false, error: "Action invalide. Choisissez 'GELER' ou 'DEGELER'." });
      }

      const carteMiseAJour = await carteService.modifierStatutCarte(req.user.id, action);

      return res.status(200).json({
        success: true,
        message: action === "GELER" ? "La carte a été gelée temporairement." : "La carte a été réactivée.",
        statut: carteMiseAJour.statut
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  // 🎛️ CONFIGURER LE PLAFOND DE LA CARTE (Gratuit)
  async changerPlafond(req, res) {
    try {
      const { limitePlafond } = req.body;

      if (!limitePlafond) {
        return res.status(400).json({ success: false, error: "Le montant du nouveau plafond est requis." });
      }

      const carteMiseAJour = await carteService.modifierPlafond(req.user.id, limitePlafond);

      return res.status(200).json({
        success: true,
        message: "Le plafond de dépenses de votre carte a été mis à jour.",
        nouveauPlafond: carteMiseAJour.limitePlafond
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }

  async voirSolde(req, res) {
    try {
      const utilisateurId = req.user.id; // Récupéré de ton middleware d'authentification
      const output = await carteService.consulterSoldeCarte(utilisateurId);
      return res.status(200).json({ success: true, data: output });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  async executerPaiementSimule(req, res) {
    try {
      const { numeroComplet, cvv, montantAchat, deviseAchat, marchand } = req.body;

      if (!numeroComplet || !cvv || !montantAchat || !deviseAchat || !marchand) {
        return res.status(400).json({ success: false, error: "Tous les champs de la carte et de l'achat sont requis." });
      }

      // 🔥 CORRECTION : On passe "deviseAchat" avec la bonne orthographe
      const result = await carteService.simulerPaiementMarchand({
        numeroComplet,
        cvv,
        montantAchat,
        deviseAchat, // <-- Corrigé ici !
        marchand
      });

      return res.status(200).json({
        success: true,
        message: "Paiement en ligne accepté par le commutateur UniPay.",
        data: result
      });
    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }

  async verifierEtAfficherNumeroCarte(req, res) {
    try {
      // Dans un vrai cas, l'id est extrait du token JWT (req.user.id)
      const { utilisateurId } = req.body;

      if (!utilisateurId) {
        return res.status(400).json({ success: false, error: "L'identifiant de l'utilisateur est requis." });
      }

      // Appel du service pour récupérer les données déchiffrées
      const coordonneesCartes = await carteService.obtenirCoordonneesSecretes(utilisateurId);

      return res.status(200).json({
        success: true,
        message: "Coordonnées de la carte récupérées avec succès.",
        data: coordonneesCartes
      });

    } catch (e) {
      return res.status(400).json({ success: false, error: e.message });
    }
  }
}

module.exports = new CarteController();