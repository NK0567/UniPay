const adminService = require("../services/admin.service");

class AdminController {
  // GET /api/v1/admin/dashboard
  async obtenirDonneeDashboard(req, res) {
    try {
      const data = await adminService.genererRapportDashboard();
      return res.status(200).json({
        succes: true,
        data
      });
    } catch (error) {
      return res.status(500).json({
        succes: false,
        message: error.message
      });
    }
  }

  // POST /api/v1/admin/cloture-gains
  async declencheCloture(req, res) {
    try {
      const resultat = await adminService.executerClotureJournaliere();
      return res.status(200).json({
        succes: true,
        message: "Tous les bénéfices de la journée ont été versés sur votre portefeuille avec succès (0 frais appliqués).",
        details: resultat
      });
    } catch (error) {
      return res.status(500).json({
        succes: false,
        message: error.message
      });
    }
  }

  // POST /api/v1/admin/recuperer-fonds (💡 INTÉGRATION DE TON EXIGENCE)
  async recupererFonds(req, res) {
    try {
      // Sécurité : Vérifier si l'utilisateur connecté possède bien le rôle ADMIN
      // Le middleware d'authentification aura déjà injecté req.user
      if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ 
          succes: false, 
          error: "Accès interdit. Droits Administrateur requis pour vider le coffre-fort." 
        });
      }

      const resultat = await adminService.recupererFondsDuCoffre(req.user.id);
      return res.status(200).json({ 
        succes: true, 
        message: "Fonds de secours récupérés avec succès.",
        data: resultat 
      });
    } catch (error) {
      return res.status(400).json({ 
        succes: false, 
        error: error.message 
      });
    }
  }

  // POST /api/v1/admin/config
  async updateConfig(req, res) {
    try {
      const { cle, valeur } = req.body;
      const configuration = await adminService.configurerParametre(cle, valeur);
      return res.status(200).json({
        succes: true,
        data: configuration
      });
    } catch (error) {
      return res.status(500).json({
        succes: false,
        message: error.message
      });
    }
  }

  // POST /api/v1/admin/agregateurs
  async createAgregateur(req, res) {
    try {
      const agregateur = await adminService.ajouterNouvelAgregateur(req.body);
      return res.status(200).json({
        succes: true,
        data: agregateur
      });
    } catch (error) {
      return res.status(500).json({
        succes: false,
        message: error.message
      });
    }
  }

  // PATCH /api/v1/admin/agregateurs/:id/statut
  async toggleAgregateur(req, res) {
    try {
      const { id } = req.params; // 🛠️ CORRECTION : Destructuring pour extraire la string ID proprement
      const { statut } = req.body;
      const agregateur = await adminService.basculerAgregateur(id, statut);
      return res.status(200).json({
        succes: true,
        data: agregateur
      });
    } catch (error) {
      return res.status(500).json({
        succes: false,
        message: error.message
      });
    }
  }
}

module.exports = new AdminController();