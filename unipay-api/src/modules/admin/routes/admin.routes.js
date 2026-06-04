const express = require('express');
const router = express.Router();
const authMiddleware = require('../../../middlewares/auth.middleware');
const adminMiddleware = require('../../../middlewares/admin.middleware');
const adminController = require('../controllers/admin.controller');
const roleMiddleware = require('../../../middlewares/role.middleware');
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');

// 🔐 Sécurisation globale : Toutes les routes nécessitent une authentification et le rôle ADMIN
router.use(authMiddleware, adminMiddleware, /*verifierVerrouOperation*/);

// 📊 Route de monitoring analytique (Moteur 360°)
router.get('/dashboard', adminController.getDashboard);

// 👤 Routes de gestion et contrôle des utilisateurs (KYC / Approbation / Suspension)
router.get('/utilisateurs/:id/profil', adminController.voirProfilUtilisateur);
router.patch('/utilisateurs/:id/statut', adminController.changerStatutUtilisateur);

// 📈 Moteur de pilotage de tarification à la volée (Commissions)
router.post('/config-finance', adminController.ajusterCommissionsSysteme);

// 💰 Gestion des reversements et coffre-fort autonome
router.post('/cloture', adminController.declencheCloture);
router.post('/recuperer-fonds', adminController.recupererFonds);

// 🔀 Actions directes sur les agrégateurs partenaires
router.post('/agregateurs', adminController.createAgregateur);
router.patch('/agregateurs/:id/statut', adminController.toggleAgregateur);

// 🔐 Routes sécurisées pour la gestion des commissions financières
router.get("/commissions", authMiddleware, roleMiddleware(["ADMIN"]), adminController.getCommissions);
router.put("/commissions", authMiddleware, roleMiddleware(["ADMIN"]), adminController.updateCommissions);

module.exports = router;