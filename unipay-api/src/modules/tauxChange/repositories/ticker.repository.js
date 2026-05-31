const prisma = require('../../../database/prisma');

class TickerRepository {
  /**
   * Récupère la liste de toutes les devises uniques et actives gérées dans UniPay
   */
  async obtenirToutesLesDevisesActives() {
    // On récupère les devises distinctes présentes dans nos configurations d'agrégateurs ou de taux
    const devises = await prisma.tauxChange.findMany({
      where: { valide: true },
      select: { deviseCible: true }
    });
    
    // On extrait un tableau de chaînes uniques (ex: ['USD', 'EUR', 'NGN', 'XAF'])
    return [...new Set(devises.map(d => d.deviseCible))];
  }
}

module.exports = new TickerRepository();