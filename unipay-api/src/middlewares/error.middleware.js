const logger = require('../utils/logger');

const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log complet de l'erreur avec le contexte de la requête HTTP
  logger.error(`Erreur capturée sur la route [${req.method}] ${req.originalUrl}`, err, {
    utilisateurId: req.user?.id || 'NON_AUTHENTIFIE',
    ip: req.ip,
    body: req.body
  });

  // Réponse standardisée pour l'application Mobile ou Web
  res.status(statusCode).json({
    succes: false,
    erreur: {
      message: statusCode === 500 ? "Une erreur interne est survenue sur le serveur." : err.message,
      code: err.code || "INTERNAL_SERVER_ERROR"
    }
  });
};

module.exports = errorMiddleware;