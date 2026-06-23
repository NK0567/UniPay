const configurationRepository = require('../repositories/configuration.repository');

class ConfigurationService {
  /**
   * Récupère un paramètre sous forme de nombre (Ex: Taux, frais, plafonds)
   */
  async obtenirNombre(cle, valeurParDefaut = 0) {
    const valeur = await configurationRepository.obtenirValeur(cle);
    if (!valeur) return valeurParDefaut;
    return parseFloat(valeur);
  }

  /**
   * Récupère un paramètre sous forme de chaîne de caractères
   */
  async obtenirTexte(cle, valeurParDefaut = "") {
    const valeur = await configurationRepository.obtenirValeur(cle);
    return valeur || valeurParDefaut;
  }

  /**
   * Récupère l'intégralité du dictionnaire sous forme d'objet { APP_NAME: "UniPay" }
   */
  async obtenirConfigurationGlobale() {
    return await configurationRepository.obtenirSousFormeObjet();
  }

  /**
   * Met à jour un paramètre système individuel
   */
  async mettreAJourParametre(cle, valeur, description, type = 'GLOBAL') {
    if (!cle || valeur === undefined) {
      throw new Error("La clé et la valeur sont requises pour modifier la configuration.");
    }
    return await configurationRepository.modifierConfiguration(cle, valeur, description, type);
  }

  /**
   * Enregistre un bloc de paramètres envoyé depuis l'interface d'administration
   * Détermine le type de configuration de manière intelligente pour la BDD
   */
  async sauvegarderParametresEnBloc(parametres) {
    if (!parametres || Object.keys(parametres).length === 0) {
      throw new Error("Le dictionnaire de paramètres ne peut pas être vide.");
    }

    const promesses = Object.entries(parametres).map(([cle, valeur]) => {
      // Détection automatique du groupe pour remplir le champ 'type' requis
      let typeConfig = "GLOBAL";
      if (cle.startsWith("COLOR_") || cle.startsWith("APP_")) {
        typeConfig = "BRANDING";
      } else if (cle.startsWith("FRAIS_") || cle.startsWith("COMMISSION_") || cle.startsWith("SPREAD_")) {
        typeConfig = "FINANCIER";
      }

      return configurationRepository.modifierConfiguration(
        cle,
        valeur,
        "Configuration mise à jour dynamiquement via le panneau d'administration",
        typeConfig
      );
    });

    await Promise.all(promesses);
    return await this.obtenirConfigurationGlobale();
  }
}

module.exports = new ConfigurationService();