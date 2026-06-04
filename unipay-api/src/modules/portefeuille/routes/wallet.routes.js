const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');

// Toutes les routes ci-dessous nécessitent que l'utilisateur soit connecté (Token JWT valide)
router.use(authMiddleware);

router.get('/solde', verifierVerrouOperation, walletController.getSolde);
// router.post('/recharge', walletController.recharger);
// router.post('/debiter', verifierVerrouOperation, walletController.debiter);

module.exports = router;