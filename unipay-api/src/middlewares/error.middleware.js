// src/middlewares/error.middleware.js
const logger = require('../utils/logger'); // Ajuste le chemin selon ton utilitaire de log si nécessaire

function errorMiddleware(err, req, res, next) {
  // 1. On récupère le statut HTTP (par défaut 500 si non défini)
  const statusCode = err.statusCode || 500;
  
  // 2. On détermine le code d'erreur textuel selon le statut
  let codeErreur = 'INTERNAL_SERVER_ERROR';
  if (statusCode === 400) codeErreur = 'BAD_REQUEST';
  if (statusCode === 401) codeErreur = 'UNAUTHORIZED';
  if (statusCode === 403) codeErreur = 'FORBIDDEN';
  if (statusCode === 404) codeErreur = 'NOT_FOUND';
  if (statusCode === 409) codeErreur = 'CONFLICT';

  // 3. Log de l'erreur dans la console pour le développeur (uniquement si c'est un vrai crash 500)
  if (statusCode === 500) {
    logger.error(`[CRASH API 500] ${req.method} ${req.originalUrl} : ${err.message}`, { stack: err.stack });
  }

  // 4. Envoi de la réponse formatée et propre au client (Postman/Flutter)
  return res.status(statusCode).json({
    success: false,
    erreur: {
      message: err.message || "Une erreur interne est survenue sur le serveur.",
      code: codeErreur
    }
  });
}

module.exports = errorMiddleware;