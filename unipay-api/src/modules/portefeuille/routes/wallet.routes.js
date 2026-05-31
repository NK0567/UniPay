const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');

// on protège la route avec le middleware: seul l'utilisateur connecté peut voir son solde
router.get('/solde', authMiddleware, verifierVerrouOperation, walletController.getSolde);

module.exports = router;