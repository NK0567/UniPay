const adminService = require("../services/admin.service");

class AdminController {
  // GET /api/v1/admin/dashboard
  async getDashboard(req, res) {
    try {
      // 💡 ID de l'admin connecté injecté par le middleware d'authentification
      const adminId = req.user?.id;

      if (!adminId) {
        return res.status(401).json({
          succes: false,
          message: "Action non autorisée. Session administrateur introuvable."
        });
      }

      // 🎯 Détection dynamique et stricte basée sur l'admin connecté (Devise, calculs)
      const rapport = await adminService.genererRapportDashboard(adminId);

      return res.status(200).json({
        succes: true,
        data: rapport
      });
    } catch (error) {
      return res.status(500).json({
        succes: false,
        message: error.message
      });
    }
  }

  // PATCH /api/v1/admin/utilisateurs/:id/statut
  async changerStatutUtilisateur(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.body; // ex: "ACTIF", "SUSPENDU"

      if (!statut) {
        return res.status(400).json({ succes: false, message: "Le statut est requis." });
      }

      const utilisateur = await adminService.modifierStatutUtilisateur(id, statut);
      return res.status(200).json({
        succes: true,
        message: `Le statut de l'utilisateur a été mis à jour avec succès : ${statut}.`,
        data: utilisateur
      });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // GET /api/v1/admin/utilisateurs/:id/profil
  async voirProfilUtilisateur(req, res) {
    try {
      const { id } = req.params;
      const profil = await adminService.consulterProfilEtSoldeUtilisateur(id);

      if (!profil) {
        return res.status(404).json({ succes: false, message: "Utilisateur introuvable." });
      }

      return res.status(200).json({ succes: true, data: profil });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // POST /api/v1/admin/config-finance
  async ajusterCommissionsSysteme(req, res) {
    try {
      const { cle, valeur } = req.body; 

      if (!cle || valeur === undefined) {
        return res.status(400).json({ succes: false, message: "La clé et la valeur sont requises." });
      }

      const configuration = await adminService.configurerFraisSysteme(cle, valeur);
      return res.status(200).json({
        succes: true,
        message: `Frais mis à jour dynamiquement pour le système UniPay.`,
        data: configuration
      });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // GET /api/unipay/admin/commissions
  async getCommissions(req, res) {
    try {
      const data = await adminService.listerCommissions();
      return res.status(200).json({
        succes: true,
        commissions: data
      });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // PUT /api/unipay/admin/commissions
  async updateCommissions(req, res) {
    try {
      const nouvellesCommissions = req.body;

      if (!nouvellesCommissions || Object.keys(nouvellesCommissions).length === 0) {
        return res.status(400).json({
          succes: false,
          message: "Le corps de la requête ne peut pas être vide."
        });
      }

      const dataMiseAJour = await adminService.mettreAJourCommissions(nouvellesCommissions);

      return res.status(200).json({
        succes: true,
        message: "Toutes les commissions ont été mises à jour avec succès.",
        commissions: dataMiseAJour
      });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // POST /api/v1/admin/cloture
  async declencheCloture(req, res) {
    try {
      const adminId = req.user?.id; 

      if (!adminId) {
        return res.status(401).json({
          succes: false,
          message: "Session administrateur manquante. Clôture refusée."
        });
      }

      const resultat = await adminService.executerClotureJournaliere(adminId);

      return res.status(200).json({
        succes: true,
        message: "Tous les bénéfices de la journée ont été archivés et versés sur votre portefeuille avec succès.",
        data: resultat 
      });
    } catch (error) {
      console.error("[UniPay Backend] Échec critique lors de la clôture :", error);
      return res.status(500).json({ 
        succes: false, 
        message: error.message || "Erreur interne lors du traitement de la clôture." 
      });
    }
  }

  // POST /api/v1/admin/recuperer-fonds
  async recupererFonds(req, res) {
    try {
      const adminId = req.user?.id;

      // 1. Double sécurité sur le rôle
      if (req.user?.role !== 'ADMIN' || !adminId) {
        return res.status(403).json({ succes: false, error: "Accès interdit. Droits Admin requis." });
      }

      // 2. 🛡️ Gestion 100% dynamique via le Service
      // Le service va vérifier le solde du coffre, adapter les calculs et extraire la devise de cet admin
      const resultat = await adminService.recupererFondsDuCoffre(adminId);

      // 3. Si le service indique que c'est déjà vide, on fait une gestion douce (Code 200) sans générer de crash DOM au front
      if (resultat.dejaVide) {
        return res.status(200).json({
          succes: true,
          message: "Le coffre est déjà vide. Aucun transfert nécessaire.",
          data: { montantRecupere: 0, devise: resultat.deviseAdmin }
        });
      }

      // 4. Succès du rapatriement réel
      return res.status(200).json({ 
        succes: true, 
        data: resultat 
      });

    } catch (error) {
      console.error("[UniPay Backend] Échec lors de la récupération des fonds :", error);
      return res.status(400).json({ 
        succes: false, 
        message: error.message || "Erreur lors du rapatriement des fonds." 
      });
    }
  }

  // POST /api/v1/admin/agregateurs
  async createAgregateur(req, res) {
    try {
      const agregateur = await adminService.ajouterNouvelAgregateur(req.body);
      return res.status(201).json({ succes: true, data: agregateur });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // PATCH /api/v1/admin/agregateurs/:id/statut
  async toggleAgregateur(req, res) {
    try {
      const { id } = req.params;
      const { statut } = req.body;
      const agregateur = await adminService.basculerAgregateur(id, statut);
      return res.status(200).json({ succes: true, data: agregateur });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }
}

module.exports = new AdminController();