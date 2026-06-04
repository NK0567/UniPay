const adminService = require("../services/admin.service");

class AdminController {
  // GET /api/v1/admin/dashboard
async getDashboard(req, res) {
  try {
    // 💡 Récupération de l'ID de l'admin connecté injecté par ton middleware d'authentification
    const adminId = req.user?.id; 

    // Sécurité au niveau du contrôleur au cas où le middleware n'aurait pas fait son travail
    if (!adminId) {
      return res.status(401).json({
        succes: false,
        message: "Action non autorisée. Session administrateur introuvable."
      });
    }

    // 🎯 On passe l'adminId au service pour la détection dynamique et stricte de sa devise
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
  // 👤 Permet de suspendre, approuver (ACTIF) ou basculer le profil d'un utilisateur
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
  // 🔍 Consultation à la trace du profil d'un client et de son solde actuel
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
  // 📈 Configuration dynamique des commissions sans toucher au code
  async ajusterCommissionsSysteme(req, res) {
    try {
      const { cle, valeur } = req.body; // ex cle: "FRAIS_RETRAIT_STANDARD", valeur: "0.015"
      
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
      // Attendre un objet comme {"FRAIS_DEPOT_PCT": 2.5, "FRAIS_RETRAIT_PCT": 1.8} dans req.body
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


  // POST /api/v1/admin/cloture-gains
  async declencheCloture(req, res) {
    try {
      const resultat = await adminService.executerClotureJournaliere();
      return res.status(200).json({
        succes: true,
        message: "Tous les bénéfices de la journée ont été versés sur votre portefeuille avec succès.",
        details: resultat
      });
    } catch (error) {
      return res.status(500).json({ succes: false, message: error.message });
    }
  }

  // POST /api/v1/admin/recuperer-fonds
  async recupererFonds(req, res) {
    try {
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ succes: false, error: "Accès interdit. Droits Admin requis." });
      }
      const resultat = await adminService.recupererFondsDuCoffre(req.user.id);
      return res.status(200).json({ succes: true, data: resultat });
    } catch (error) {
      return res.status(400).json({ succes: false, error: error.message });
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