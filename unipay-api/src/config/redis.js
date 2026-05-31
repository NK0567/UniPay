const { createClient } = require('redis');
const env = require('./env');
const logger = require('../utils/logger'); // Utilitaire de log de ton arborescence

const clientRedis = createClient({
  url: env.redis.url
});

clientRedis.on('error', (err) => logger.error('[REDIS ERROR] Échec de connexion client :', err));
clientRedis.on('connect', () => logger.info('⚡ Connexion établie avec le serveur de Cache Redis UniPay.'));

// Connexion asynchrone immédiate au lancement
(async () => {
  if (process.env.NODE_ENV !== 'test') {
    await clientRedis.connect();
  }
})();

module.exports = clientRedis;