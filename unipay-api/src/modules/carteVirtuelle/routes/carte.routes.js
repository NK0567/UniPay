const express = require('express');
const router = express.Router();
const carteController = require('../controllers/carte.controller');
const authMiddleware = require('../../../middlewares/auth.middleware'); // Vérifie le chemin vers ton middleware de sécurité JWT
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');

// Toutes nos routes exigent d'être connecté
router.post('/activer', authMiddleware, carteController.creer);
router.post('/statut', authMiddleware, carteController.gererStatut);
router.post('/plafond', authMiddleware, carteController.changerPlafond);
router.get('/solde', authMiddleware, carteController.voirSolde);
router.post('/paiement-simulation', authMiddleware, carteController.executerPaiementSimule);
router.post('/reveler', authMiddleware, verifierVerrouOperation, carteController.verifierEtAfficherNumeroCarte);

module.exports = router;