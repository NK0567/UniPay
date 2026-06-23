const express = require('express');
const router = express.Router();
const configurationController = require('../controllers/configuration.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const roleMiddleware = require('../../../middlewares/role.middleware');

// 🔐 Middleware de restriction d'infrastructure : ADMIN obligatoire
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// Définition des passerelles d'administration
router.get('/', configurationController.listerToutes);
router.put('/modifier', configurationController.modifierParametre);
router.post('/bloc', configurationController.sauvegarderBlocConfig); // Liaison avec la page de modification de branding du Frontend

module.exports = router;