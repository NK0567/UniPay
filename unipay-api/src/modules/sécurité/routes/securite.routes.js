const express = require('express');
const router = express.Router();
const securiteController = require('../controllers/securite.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const roleMiddleware = require('../../../middlewares/role.middleware');

// 🔐 Sécurisation stricte
router.use(authMiddleware);

// Seul l'ADMIN peut lever une sanction ou un blocage de sécurité
router.post('/debloquer-wallet', roleMiddleware(['ADMIN']), securiteController.debloquerCompte);

module.exports = router;