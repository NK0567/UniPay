const express = require('express');
const ctrl = require('../controllers/auth.controller');
const v = require('../validators/auth.validator');
const authMiddleware = require('../../../middlewares/auth.middleware')

const router = express.Router();

// on definit la route POST pour l'utilisateur
// Elle sera accessible via /api/auth/reister
router.post('/register', v.validerInscription, ctrl.inscription.bind(ctrl));
router.post('/login', v.validerConnexion, ctrl.connexion.bind(ctrl));
router.post('/forgot-password', v.validerDemandeReset, ctrl.motDePasseOublie.bind(ctrl));
router.post('/reset-password', v.validerExecutionReset, ctrl.recupererMotDePasse.bind(ctrl));
router.post('/configurer-pin', v.validerInitialiserPin, ctrl.initialiserPin.bind(ctrl));
router.post('/modifier-pin', v.validerChangerPin, ctrl.changerPin.bind(ctrl));

// on crée une route de test protégée
// seul un utilisateur avec un token valide pourra voir ce message
router.get('/profil', authMiddleware, (req, res)=>{
    res.json({
        succes: true,
        message: 'Accès autorisé, Bienvenue sur votre profil sécurisé',
        votre_id_code: req.user.id // Preuve que le middleware a décodé le token
    })
})

module.exports = router;