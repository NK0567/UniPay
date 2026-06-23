const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/user.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const roleMiddleware = require('../../../middlewares/role.middleware');

// 🔐 Authentification obligatoire pour tout le module Utilisateur
router.use(authMiddleware);

// 🏛️ Routes Administratives & Conformité (Admin et Agents Humanitaires uniquement)

// 🌍 Nouvelle route dynamique pour l'ancrage Pays du Currency Helper
router.get(
  '/admin/devises-pays', 
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']), 
  utilisateurController.obtenirDevisesEtPays
);

router.get(
  '/admin/liste', 
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']), 
  utilisateurController.obtenirTousLesUtilisateurs
);

router.post(
  '/admin/valider-kyc', 
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']), 
  utilisateurController.validerKycClient
);

router.patch(
  '/admin/:id/statut',
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']),
  utilisateurController.changerStatutCompte
);

// Création complète d'un utilisateur par un Admin/Agent
router.post(
  '/admin/creer-utilisateur', 
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']), 
  utilisateurController.creerUtilisateurParAdmin
);

// Modification complète du profil d'un utilisateur par un Admin/Agent
router.put(
  '/admin/:id/modifier-profil', 
  roleMiddleware(['ADMIN', 'AGENT_HUMANITAIRE']), 
  utilisateurController.modifierProfilParAdmin
);

// 📱 Routes Personnelles (Application Flutter Client / Agent)
router.get('/me', utilisateurController.getMonProfil);
router.put('/me', utilisateurController.updateMonProfil);

module.exports = router;