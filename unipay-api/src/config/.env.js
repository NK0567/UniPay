require('dotenv').config();

const variablesRequises = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PORT'
];

// Vérification stricte au démarrage
for (const variable of variablesRequises) {
  if (!process.env[variable]) {
    throw new Error(`[CRITICAL] La variable d'environnement ${variable} est manquante dans le fichier .env !`);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '24h'
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  }
};