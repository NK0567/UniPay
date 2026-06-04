const prisma = require('../../../database/prisma');

class AgregateurManager {
  /**
   * 🧠 MOTEUR DE SMART ROUTING DYNAMIQUE
   * Sélectionne l'agrégateur en mode TEST ou ACTIF le moins cher (Commission + Frais fixes cumulés)
   */
  async selectionnerMeilleurAgregateur(paysCode, typeOperation) {
    // operationType en BD accepte DEPOT, RETRAIT, ou LES_DEUX
    const typesAcceptes = [typeOperation, 'LES_DEUX'];

    const agregateursDisponibles = await prisma.agregateur.findMany({
      where: {
        pays: paysCode.toUpperCase(),
        statut: { in: ['ACTIF', 'TEST'] }, // On accepte les modes Sandbox en dev
        operationType: { in: typesAcceptes }
      }
    });

    if (!agregateursDisponibles || agregateursDisponibles.length === 0) {
      throw new Error(`Configuration manquante : Aucun agrégateur disponible pour le pays [${paysCode}] et l'opération [${typeOperation}].`);
    }

    // Algorithme de Smart Routing : on trie par coût total théorique ascendant
    // On simule sur une base de 10 000 unités pour estimer l'impact combiné du % et du fixe
    const montantSimulation = 10000;
    
    agregateursDisponibles.sort((a, b) => {
      const coutA = (montantSimulation * parseFloat(a.commissionPct)) + parseFloat(a.fraisFixes);
      const coutB = (montantSimulation * parseFloat(b.commissionPct)) + parseFloat(b.fraisFixes);
      return coutA - coutB; // Le moins cher en premier
    });

    return agregateursDisponibles[0];
  }

  /**
   * 🔌 PROVIDER ENGINE
   * Retourne l'instance du driver d'exécution (ici, notre simulateur universel)
   */
  getProviderService(agregateur) {
    const SimulateurProvider = require('./simulateur.provider');
    return new SimulateurProvider(agregateur);
  }
}

module.exports = new AgregateurManager();