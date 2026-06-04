/**
 * 🔧 REFACTORING: Utilitaire de Validation Centralisé
 * 
 * Élimine la redondance de code de validation répétée 5+ fois dans les contrôleurs
 * Patterns de validation consolidés en UN SEUL ENDROIT pour maintenabilité
 * 
 * À UTILISER dans tous les contrôleurs au lieu de réécrire la même logique
 */

const ValidatorUtil = {
  /**
   * Valide qu'un montant est valide (nombre positif)
   * @param {number} montant - Le montant à valider
   * @param {string} nomChamp - Nom du champ pour le message d'erreur (par défaut "montant")
   * @throws {Error} Si le montant n'est pas valide
   */
  validerMontant(montant, nomChamp = "Le montant") {
    if (montant === undefined || montant === null || montant === '') {
      throw new Error(`${nomChamp} est requis.`);
    }
    
    const montantNum = parseFloat(montant);
    if (isNaN(montantNum)) {
      throw new Error(`${nomChamp} doit être un nombre valide.`);
    }
    
    if (montantNum <= 0) {
      throw new Error(`${nomChamp} doit être supérieur à 0.`);
    }
    
    return montantNum;
  },

  /**
   * Valide qu'une chaîne n'est pas vide
   * @param {string} valeur - La valeur à valider
   * @param {string} nomChamp - Nom du champ pour le message d'erreur
   * @throws {Error} Si la valeur est vide
   */
  validerChaineNonVide(valeur, nomChamp = "Le champ") {
    if (!valeur || typeof valeur !== 'string' || valeur.trim() === '') {
      throw new Error(`${nomChamp} est requis et ne peut pas être vide.`);
    }
    return valeur.trim();
  },

  /**
   * Valide qu'un email est au format correct (validation simple)
   * @param {string} email - L'email à valider
   * @throws {Error} Si l'email n'est pas valide
   */
  validerEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error("L'adresse email n'est pas au format correct.");
    }
    return email.toLowerCase();
  },

  /**
   * Valide qu'un numéro de téléphone est au format correct (simple)
   * @param {string} telephone - Le numéro à valider
   * @throws {Error} Si le téléphone n'est pas valide
   */
  validerTelephone(telephone) {
    const phoneRegex = /^[0-9+\-\s()]{7,}$/;
    if (!telephone || !phoneRegex.test(telephone)) {
      throw new Error("Le numéro de téléphone n'est pas au format correct.");
    }
    return telephone.trim();
  },

  /**
   * Valide qu'une devise est supportée
   * @param {string} devise - La devise à valider (ex: "USD", "EUR", "XAF")
   * @param {Array<string>} devisesValides - Liste des devises acceptées
   * @throws {Error} Si la devise n'est pas supportée
   */
  validerDevise(devise, devisesValides = ["USD", "EUR", "CAD", "XAF"]) {
    const deviseUppercase = devise?.toUpperCase();
    if (!deviseUppercase || !devisesValides.includes(deviseUppercase)) {
      throw new Error(`La devise "${devise}" n'est pas supportée. Devises acceptées: ${devisesValides.join(", ")}`);
    }
    return deviseUppercase;
  },

  /**
   * Valide que les paramètres obligatoires POST sont présents
   * @param {Object} body - Le corps de la requête
   * @param {Array<string>} champsObligatoires - Liste des champs qui doivent être présents
   * @throws {Error} Si un champ obligatoire manque
   */
  validerChampsObligatoires(body, champsObligatoires) {
    const champsManquants = champsObligatoires.filter(
      champ => !body[champ] || (typeof body[champ] === 'string' && body[champ].trim() === '')
    );

    if (champsManquants.length > 0) {
      throw new Error(
        `Champs obligatoires manquants: ${champsManquants.join(", ")}`
      );
    }

    return true;
  },

  /**
   * Valide qu'un ID est au format UUID/objectId valide
   * @param {string} id - L'ID à valider
   * @throws {Error} Si l'ID n'est pas valide
   */
  validerID(id, nomChamp = "L'ID") {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`${nomChamp} est requis.`);
    }
    // Validation basique: pas vide et longueur raisonnable (UUID ou MongoDB)
    if (id.length < 10 || id.length > 36) {
      throw new Error(`${nomChamp} n'est pas au format correct.`);
    }
    return id.trim();
  },

  /**
   * Nettoie et normalise un texte (supprime espaces, minuscules, etc)
   * @param {string} texte - Le texte à nettoyer
   * @returns {string} Le texte nettoyé
   */
  nettoyerTexte(texte) {
    if (typeof texte !== 'string') return '';
    return texte.trim().toLowerCase().replace(/\s+/g, ' ');
  },

  /**
   * Arrondit un nombre décimal au nombre de chiffres spécifié (pour devises)
   * @param {number} nombre - Le nombre à arrondir
   * @param {number} decimales - Nombre de décimales (par défaut 4 pour devises)
   * @returns {number} Le nombre arrondi
   */
  arrondirDevise(nombre, decimales = 4) {
    const multiplicateur = Math.pow(10, decimales);
    return Math.round(nombre * multiplicateur) / multiplicateur;
  }
};

module.exports = ValidatorUtil;
