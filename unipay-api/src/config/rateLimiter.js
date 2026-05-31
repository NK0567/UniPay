// Protection anti spam / brute force

// Très important fintech.
// https://www.npmjs.com/package/express-rate-limit
// https://www.npmjs.com/package/rate-limiter-flexible

const rateLimit = require('express-rate-limit');

const limiteurGenerique = rateLimit({
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true, // Renvoie les infos de limite dans les headers RateLimit-*
  legacyHeaders: false, // Désactive X-RateLimit-*
  message: {
    success: false,
    error: "Trop de requêtes détectées depuis cette adresse IP. Veuillez patienter 15 minutes."
  }
});

// Limiteur ultra-strict pour les paiements et retraits
const limiteurPaiement = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Maximun 5 tentatives de retrait par minute
  message: {
    success: false,
    error: "Opérations trop fréquentes. Sécurisation UniPay : attendez une minute avant de réessayer."
  }
});

module.exports = {
  limiteurGenerique,
  limiteurPaiement
};