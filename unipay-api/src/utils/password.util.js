const bcrypt = require('bcrypt');

const PasswordUtil = {
  /**
   * Hache un mot de passe brut avec un grain de sel de 12 clés
   * @param {string} motDePasse 
   * @returns {Promise<string>}
   */
  async hacher(motDePasse) {
    if (!motDePasse) {
      throw new Error("Le mot de passe brut est requis pour le hachage.");
    }
    const salt = await bcrypt.genSalt(12);
    return await bcrypt.hash(motDePasse, salt);
  },

  /**
   * Compare un mot de passe brut avec un hash de la base de données
   * @param {string} motDePasseSaisi 
   * @param {string} motDePasseHache 
   * @returns {Promise<boolean>}
   */
  async comparer(motDePasseSaisi, motDePasseHache) {
    if (!motDePasseSaisi || !motDePasseHache) {
      throw new Error("Les deux arguments (saisi et haché) sont requis pour la comparaison.");
    }
    return await bcrypt.compare(motDePasseSaisi, motDePasseHache);
  }
};

module.exports = PasswordUtil;