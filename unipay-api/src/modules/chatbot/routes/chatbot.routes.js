const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');
const authMiddleware = require('../../../middlewares/auth.middleware'); // Ton middleware d'authentification

// Route unique pour interagir avec l'assistant UniPay
router.post('/message', authMiddleware, chatbotController.recevoirMessage);

module.exports = router;