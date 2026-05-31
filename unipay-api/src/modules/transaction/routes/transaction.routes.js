const express = require('express')
const router = express.Router()
const transactionController = require('../controllers/transaction.controller')
const authMiddleware = require('../../../middlewares/auth.middleware')
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware')

// on protège le route avec le gade-barrière JWT pour exécuter les paiements à partir d'un code de lien
router.post('/payer-lien', authMiddleware, verifierVerrouOperation, transactionController.effectuerPaiementLien)

module.exports = router;