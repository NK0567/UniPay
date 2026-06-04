const express = require('express');
const router = express.Router();
const epargneController = require('../controllers/epargne.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');

// 🛣️ Définition des points d'accès du module d'épargne
router.post('/creer', authMiddleware, epargneController.creer); 
router.post('/alimenter', authMiddleware, verifierVerrouOperation, epargneController.alimenter);
router.post('/liquider/:id', authMiddleware, verifierVerrouOperation, epargneController.liquider);
router.patch('/:id/toggle-intelligent', authMiddleware, epargneController.basculerToggle);
// 🔍 Route d'analyse prédictive de la capacité d'épargne
router.get('/analyser-capacite', authMiddleware, epargneController.obtenirAnalyseCapacite);

module.exports = router;