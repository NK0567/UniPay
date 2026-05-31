const express = require('express');
const router = express.Router();
const configurationController = require('../controllers/configuration.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const roleMiddleware = require('../../../middlewares/role.middleware');

// 🔐 Protection stricte du module de configuration
router.use(authMiddleware);
router.use(roleMiddleware(['ADMIN']));

// Routes d'administration des paramètres de la Fintech
router.get('/', configurationController.listerToutes);
router.put('/modifier', configurationController.modifierParametre);

module.exports = router;