const express = require('express')
const router = express.Router()
const ctrl = require('../controllers/lien.controller')
const authMiddleware = require('../../../middlewares/auth.middleware')

// Route 1 : Le demandeur connecté génère son lien
router.post('/generate', authMiddleware, ctrl.genererLien.bind(ctrl));

// Route 2 : L'application mobile (ou le navigateur) inspecte le lien pour afficher la carte d'identité du demandeur (Pas besoin de connexion pour voir)
router.get('/inspect/:codeUnique', ctrl.inspecterLien.bind(ctrl));

// Route 3 : Le payeur connecté valide le paiement depuis la carte du lien
router.post('/pay', authMiddleware, ctrl.payerLien.bind(ctrl));

module.exports = router;