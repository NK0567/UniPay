const EventEmitter = require('events');
class NotificationEventEmitter extends EventEmitter {}

// Une seule instance partagée dans toute l'application
const notificationEventEmitter = new NotificationEventEmitter();
module.exports = notificationEventEmitter;