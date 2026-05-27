const express = require('express');
const router = express.Router()
const authMiddleware = require('../../../middlewares/auth.middleware')
const adminMiddleware = require('../../../middlewares/admin.middleware');
const adminController = require('../controllers/admin.controller');

// toute les routes de ce module nécessite d'etre s'authentifié Admin
router.use(authMiddleware, adminMiddleware)

// Routes de monitoring
router.get('/dashboard', adminController.obtenirDonneeDashboard);

// Moteurs de gestion financière et routages de bénéfices
router.post('/cloture', adminController.declencheCloture);
router.post('/recuperer-fonds', adminController.recupererFonds); // 💡 NOUVEAU : Endpoint pour vider le coffre-fort autonome
router.post('/config', adminController.updateConfig);

// Gestion des agrégateurs partenaires (Dépôts / Retraits MoMo, OM, Cartes)
router.post('/agregateurs', adminController.createAgregateur);
router.patch('/agregateurs/:id/statut', adminController.toggleAgregateur);

module.exports = router;