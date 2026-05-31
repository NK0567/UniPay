const walletRepository = require('../../portefeuille/repositories/wallet.repository');
const tickerRepository = require('../repositories/ticker.repository');
const conversionService = require('../../transaction/services/conversion.service');

class TickerService {
  /**
   * Génère le tableau des conversions pour le placeholder du dashboard
   */
  async obtenirConversionsTicker(utilisateurId) {
    // 1. Trouver le portefeuille de l'utilisateur pour connaître sa devise locale
    const portefeuille = await walletRepository.findByUtilisateurId(utilisateurId);
    if (!portefeuille) {
      throw new Error("Portefeuille introuvable pour cet utilisateur.");
    }

    const deviseLocale = portefeuille.devise; // Ex: XAF ou USD
    const montantDeBase = 1.0; // On veut toujours savoir la valeur de 1 unité locale

    // 2. Récupérer toutes les devises gérées par UniPay
    const toutesLesDevises = await tickerRepository.obtenirToutesLesDevisesActives();

    const conversionsResultat = [];

    // 3. Boucler sur chaque devise pour simuler la conversion avec le Spread UniPay
    for (const deviseCible of toutesLesDevises) {
      // On évite de convertir le XAF en XAF
      if (deviseCible === devisesLocale) continue;

      try {
        const calcul = await conversionService.calculerConversionDynamique(
          montantDeBase,
          deviseLocale,
          deviseCible
        );

        conversionsResultat.push({
          deviseCible: Math.toUpperCase(deviseCible),
          valeurConvertie: calcul.montantConverti,
          texteAffichage: `1 ${deviseLocale} = ${calcul.montantConverti} ${deviseCible}`
        });
      } catch (error) {
        // Si un couloir de change n'est pas encore configuré, on l'ignore proprement
        continue;
      }
    }

    return {
      deviseLocale,
      montantDeBase,
      listeConversions: conversionsResultat
    };
  }
}

module.exports = new TickerService();