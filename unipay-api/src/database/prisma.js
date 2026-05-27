// On importe le client Prisma qui a été généré après ta migration
const { PrismaClient } = require('@prisma/client');

// On crée une instance unique (un "singleton") pour tout le projet
// Cela évite d'ouvrir trop de connexions à ta base MySQL
const prisma = new PrismaClient();

// On exporte cette instance pour l'utiliser dans nos repositories
module.exports = prisma;