const prisma = require('../../../database/prisma');

class TauxChangeRepository {
  /**
   * Récupère le dernier taux valide enregistré en BDD
   */
  async obtenirTauxValide(deviseSource, deviseCible) {
    return await prisma.tauxChange.findFirst({
      where: {
        deviseSource: deviseSource.toUpperCase(),
        deviseCible: deviseCible.toUpperCase(),
        valide: true
      },
      orderBy: {
        dateMiseAJour: 'desc'
      }
    });
  }

  /**
   * Met à jour ou crée un nouveau taux de change calculé
   */
  async enregistrerNouveauTaux(deviseSource, deviseCible, valeurTaux) {
    return await prisma.tauxChange.create({
      data: {
        deviseSource: deviseSource.toUpperCase(),
        deviseCible: deviseCible.toUpperCase(),
        taux: valeurTaux,
        valide: true
      }
    });
  }

  /**
   * Récupère le spread configuré pour une devise spécifique
   */
  async obtenirSpreadConfiguration(devise) {
    const config = await prisma.configurationSysteme.findUnique({
      where: { cle: `SPREAD_${devise.toUpperCase()}` }
    });
    // Retourne le spread sous forme de float (ex: 0.02 pour 2%), sinon 1.5% par défaut
    return config ? parseFloat(config.valeur) : 0.015;
  }
}

module.exports = new TauxChangeRepository();