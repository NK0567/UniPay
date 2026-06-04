const tauxChangeRepository = require('../../tauxChange/repositories/tauxChange.repository');

/**
 * 🔧 REFACTORING: Service de conversion unifié et centralisé
 * Remplace l'ancien ConversionService de 'transaction' (deprecated)
 * Fournit les méthodes synchrone et asynchrone pour compatibilité
 */
class ConversionService {
  /**
   * Calcule le montant converti destiné au récepteur et isole la marge commerciale
   * Version ASYNCHRONE (recommandée) - récupère les données de la BDD
   */
  async calculerConversionDynamique(montantSource, deviseSource, deviseCible) {
    if (deviseSource === deviseCible) {
      return {
        tauxApplique: 1,
        montantConverti: montantSource,
        gainSpread: 0
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
      tauxApplique: tauxClientUniPay, // 🔧 REFACTORING: Normalisé le nom pour compatibilité
      montantConverti: parseFloat(montantConvertiPourClient.toFixed(4)),
      gainSpread: parseFloat(gainSpreadEnDeviseCible.toFixed(4)) // 🔧 Normalisé "gainSpreadLocal" → "gainSpread"
    };
  }

  /**
   * Wrapper compatible synchrone (DEPRECATED mais gardé pour migration progressive)
   * 🔧 REFACTORING: Méthode de compatibilité - préférer calculerConversionDynamique()
   */
  calculerConversion(deviseSource, deviseCible, montantSource) {
    // ⚠️ ATTENTION: Cette méthode est synchrone mais les données viennent de la BDD
    // Elle va bloquer si la BD est lente. Migration en cours vers async.
    throw new Error(
      '❌ calculerConversion() DEPRECATED - Utilisez calculerConversionDynamique(async) à la place.\n' +
      'Cette méthode bloquera l\'application. Migration requise dans transaction.service.js'
    );
  }
}

module.exports = new ConversionService();