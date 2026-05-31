const prisma = require('../../../database/prisma');

class ConfigurationRepository {
  /**
   * Récupère la valeur d'une configuration par sa clé
   */
  async obtenirValeur(cle) {
    const config = await prisma.appConfig.findUnique({
      where: { cle }
    });
    return config ? config.valeur : null;
  }

  /**
   * Récupère toutes les configurations (utile pour le tableau de bord Admin)
   */
  async obtenirToutes() {
    return await prisma.appConfig.findMany({
      orderBy: { cle: 'asc' }
    });
  }

  /**
   * Crée ou modifie une configuration (Upsert)
   */
  async modifierConfiguration(cle, valeur, description) {
    return await prisma.appConfig.upsert({
      where: { cle },
      update: { valeur, description },
      create: { cle, valeur, description }
    });
  }
}

module.exports = new ConfigurationRepository();