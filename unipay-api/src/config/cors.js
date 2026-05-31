const cors = require('cors');

const listeBlanche = [
  'http://localhost:3000', // Exemple : Dashboard Web Admin local
  // Tu ajouteras ici l'URL de production de ton back-office
];

const configurationsCors = {
  origin: (origin, callback) => {
    // Les applications mobiles (Flutter) n'ont parfois pas d'en-tête 'origin' (null/undefined)
    if (!origin || listeBlanche.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Accès refusé par la politique CORS d\'UniPay.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = cors(configurationsCors);