const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateur.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const roleMiddleware = require('../../../middlewares/role.middleware');

// 🔐 Authentification obligatoire pour tout le module Utilisateur
router.use(authMiddleware);

// Routes Personnelles (Application Flutter Client / Agent)
router.get('/me', utilisateurController.getMonProfil);
router.put('/me', utilisateurController.updateMonProfil);

// 🏛️ Route de Conformité Réglementaire
// Seuls les Administrateurs et les AGENTS_HUMANITAIRES peuvent valider les niveaux de KYC des comptes
router.post(
  '/admin/valider-kyc', 
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']), 
  utilisateurController.validerKycClient
);

module.exports = router;