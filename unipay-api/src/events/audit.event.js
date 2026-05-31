const EventEmitter = require('events');
const auditRepository = require('../modules/audit/repositories/audit.repository');
const logger = require('../utils/logger');

class AuditEmitter extends EventEmitter {}
const auditEventEmitter = new AuditEmitter();

// Écouteur global des événements d'audit
auditEventEmitter.on('log', async (data) => {
  try {
    await auditRepository.enregistrer(data);
  } catch (error) {
    // Si la BDD lâche, le fichier log de secours prend le relais
    logger.error("Échec de l'écriture de l'audit log en BDD", error, data);
  }
});

module.exports = auditEventEmitter;