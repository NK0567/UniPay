const express = require('express');
const router = express.Router();
const epargneController = require('../controllers/epargne.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const verifierVerrouOperation = require('../../../middlewares/operationAuth.middleware');


// 🆕 On ajoute la route de création en premier !
router.post('/creer', authMiddleware, epargneController.creer); 
router.post('/alimenter', authMiddleware, verifierVerrouOperation, epargneController.alimenter);
router.post('/liquider/:id', authMiddleware, verifierVerrouOperation, epargneController.liquider);
router.patch('/:id/toggle-intelligent', authMiddleware, epargneController.basculerToggle);

module.exports = router;