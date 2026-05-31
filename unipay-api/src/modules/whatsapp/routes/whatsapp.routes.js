const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsapp.controller');

// Route de vérification de Meta (GET)
router.get('/webhook', whatsappController.verifierWebhook);

// Route de réception des messages (POST)
router.post('/webhook', whatsappController.recevoirMessage);

module.exports = router;