const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const roleMiddleware = require('../../../middlewares/role.middleware'); // Pour bloquer les accès non-admin
const adminMiddleware = require('../../../middlewares/admin.middleware');

// 🔐 Sécurisation globale du module
router.use(authMiddleware);

// Route pour le dashboard de l'utilisateur connecté (Flutter Home App)
router.get('/me', dashboardController.getClientDashboard);

// Route pour le rapport comptable (Back-Office Admin UniPay)
// Seuls les utilisateurs avec le rôle 'ADMIN' peuvent franchir ce garde-fou
router.get('/admin/rapport-comptable', roleMiddleware(['ADMIN']), dashboardController.getAdminRapportComptable);

// Exemples d'utilisations dans ton architecture :


// 1. Seuls les Admins peuvent voir le rapport comptable (ce qu'on a fait pour le Dashboard)
router.get('/admin/rapport-comptable', roleMiddleware(['ADMIN']), dashboardController.getAdminRapportComptable);

// 🏛️ EXTENSION RAPPORT : Sécurisée exclusivement pour l'ADMIN
router.get(
  '/admin/rapports/generer', 
  roleMiddleware(['ADMIN']), 
  dashboardController.getAdminRapportComptable
);

module.exports = router;