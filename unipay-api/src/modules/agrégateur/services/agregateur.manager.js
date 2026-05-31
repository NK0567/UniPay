const prisma = require('../../../database/prisma');
const orangeService = require('./orange.service');
const mtnService = require('./mtn.service');
const simulationService = require('./simulation.service');

class AgregateurManager {
  /**
   * 🧠 MOTEUR DE ROUTAGE INTELLIGENT (Smart Routing)
   * Trouve l'agrégateur le plus rentable pour une opération donnée dans un pays donné
   */
  async selectionnerMeilleurAgregateur(pays, typeOperation) {
    const typeRecherche = typeOperation === "DEPOT" ? "DEPOT" : "RETRAIT";

    // Recherche des agrégateurs disponibles (Actifs ou en mode Test pour les devs)
    const agregateurs = await prisma.agregateur.findMany({
      where: {
        pays: pays,
        statut: { in: ["ACTIF", "TEST"] },
        operationType: { in: [typeRecherche, "LES_DEUX"] }
      }
    });

    if (agregateurs.length === 0) {
      throw new Error(`Aucun canal de paiement disponible pour le pays : ${pays}`);
    }

    // 🏎️ Tri par coût financier croissant (Le moins cher en premier)
    // Coût = Commission % + Frais Fixes
    agregateurs.sort((a, b) => {
      const coutA = parseFloat(a.commissionPct) + parseFloat(a.fraisFixes);
      const coutB = parseFloat(b.commissionPct) + parseFloat(b.fraisFixes);
      return coutA - coutB;
    });

    // Renvoie le plus optimal (Le premier de la liste)
    return agregateurs[0];
  }

  /**
   * 🎛️ FACTORY D'EXÉCUTION
   * Redirige vers le bon SDK fournisseur ou vers le simulateur si statut = TEST
   */
  getProviderService(agregateur) {
    // RÈGLE BANCAIRE DE TEST : Si l'agrégateur est en statut TEST, on déroute vers le simulateur
    if (agregateur.statut === "TEST") {
      return simulationService;
    }

    // Sinon, on aiguille vers le vrai code de production
    switch (agregateur.nom.toUpperCase()) {
      case 'ORANGE_MONEY':
      case 'ORANGE':
        return orangeService;
      case 'MTN_MOMO':
      case 'MTN':
        return mtnService;
      default:
        // Par défaut, si pas encore de code de prod branché, on utilise la simulation sécurisée
        return simulationService;
    }
  }
}

module.exports = new AgregateurManager();