const express = require('express');
const router = express.Router();
const paiementController = require('../controllers/paiement.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');

// 🔐 Toutes les routes de paiement exigent que l'utilisateur soit connecté (JWT)
router.use(authMiddleware);

// Route pour charger le portefeuille (Dépôt / Cash-In)
router.post('/depot', paiementController.depot);

// Route pour vider des fonds vers son mobile (Retrait / Cash-Out)
router.post('/retrait', verifierVerrouOperation, paiementController.retrait);

module.exports = router;