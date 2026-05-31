const tauxChangeRepository = require('../../tauxChange/repositories/tauxChange.repository');

class ConversionService {
  /**
   * Calcule le montant converti destiné au récepteur et isole la marge commerciale
   */
  async calculerConversionDynamique(montantSource, deviseSource, deviseCible) {
    if (deviseSource === deviseCible) {
      return {
        tauxApplique: 1,
        montantConverti: montantSource,
        gainSpreadLocal: 0
      };
    }

    // 1. Récupérer le taux de change brut en BDD (mis à jour par le Cron Job)
    const enregistrementTaux = await tauxChangeRepository.obtenirTauxValide(deviseSource, deviseCible);
    if (!enregistrementTaux) {
      throw new Error(`Le couloir de change ${deviseSource} vers ${deviseCible} n'est pas disponible actuellement.`);
    }

    const tauxBrutMarché = parseFloat(enregistrementTaux.taux);

    // 2. Récupérer et appliquer le Spread configuré par l'Admin
    const tauxSpread = await tauxChangeRepository.obtenirSpreadConfiguration(deviseSource);
    
    // Taux final diminué de la marge commerciale pour l'utilisateur
    const tauxClientUniPay = tauxBrutMarché * (1 - tauxSpread);

    // 3. Calculs des montants
    const montantConvertiPourClient = montantSource * tauxClientUniPay;
    const montantAuTauxRéel = montantSource * tauxBrutMarché;
    
    // La différence représente le gain direct de UniPay dans la devise cible
    const gainSpreadEnDeviseCible = montantAuTauxRéel - montantConvertiPourClient;

    return {
      tauxChangeId: enregistrementTaux.id,
      tauxBrut: tauxBrutMarché,
      tauxAppliqueAuClient: tauxClientUniPay,
      montantConverti: parseFloat(montantConvertiPourClient.toFixed(4)),
      gainSpreadLocal: parseFloat(gainSpreadEnDeviseCible.toFixed(4))
    };
  }
}

module.exports = new ConversionService();