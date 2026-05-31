const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../../../middlewares/auth.middleware');

router.get('/historique', authMiddleware, notificationController.getMesNotifications);

module.exports = router;