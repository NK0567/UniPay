const prisma = require('../../../database/prisma');

class ConfigurationRepository {
  /**
   * Récupère la valeur d'une configuration par sa clé
   */
  async obtenirValeur(cle) {
    const config = await prisma.configurationSysteme.findUnique({
      where: { cle: cle.toUpperCase().trim() }
    });
    return config ? config.valeur : null;
  }

  /**
   * Récupère toutes les configurations (utile pour le tableau de bord Admin)
   */
  async obtenirToutes() {
    return await prisma.configurationSysteme.findMany({
      orderBy: { cle: 'asc' }
    });
  }

  /**
   * Récupère toutes les configurations sous forme d'objet Clé-Valeur
   */
  async obtenirSousFormeObjet() {
    const configs = await prisma.configurationSysteme.findMany();
    return configs.reduce((acc, curr) => {
      acc[curr.cle] = curr.valeur;
      return acc;
    }, {});
  }

  /**
   * Crée ou modifie une configuration (Upsert)
   */
  async modifierConfiguration(cle, valeur, description, type = 'GLOBAL') {
    const cleFormatee = cle.toUpperCase().trim();
    return await prisma.configurationSysteme.upsert({
      where: { cle: cleFormatee },
      update: { valeur: String(valeur), description },
      create: { cle: cleFormatee, valeur: String(valeur), description, type }
    });
  }
}

module.exports = new ConfigurationRepository();