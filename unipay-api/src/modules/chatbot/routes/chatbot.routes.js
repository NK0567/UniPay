const express = require('express');
const chatbotController = require('../controllers/chatbot.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');
const router = express.Router()

// route simulant l'interaction textuelle avec le chatbot
router.post('/message', authMiddleware, chatbotController.webhook)

module.exports = router