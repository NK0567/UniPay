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
   * Met à jour un paramètre système (Réservé à l'administration)
   */
  async mettreAJourParametre(cle, valeur, description, adminId) {
    // Validation rapide
    if (!cle || valeur === undefined) {
      throw new Error("La clé et la valeur sont requises pour modifier la configuration.");
    }

    const configMiseAJour = await configurationRepository.modifierConfiguration(
      cle.toUpperCase().trim(),
      String(valeur),
      description
    );

    // (Optionnel) Tu pourrais déclencher un log de sécurité ici via ton SecuriteRepository
    // pour tracer quel Admin a modifié les frais de la plateforme.

    return configMiseAJour;
  }
}

module.exports = new ConfigurationService();