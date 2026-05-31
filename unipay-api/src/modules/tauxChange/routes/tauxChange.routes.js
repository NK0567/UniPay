const express = require('express');
const router = express.Router();
const tauxChangeController = require('../controllers/tauxChange.controller');
const tickerController = require('../controllers/ticker.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

// Route publique existante pour le convertisseur de l'app
router.get('/simuler', tauxChangeController.simulerConversion);

// 🔐 Route sécurisée pour le placeholder dynamique du Dashboard utilisateur
router.get('/ticker-dashboard', authMiddleware, tickerController.obtenirTickerDashboard);

module.exports = router;