const authRepository = require('../repositories/auth.repository');
const currencyHelper = require('../../../helpers/currency.helper');
const passwordUtil = require('../../../utils/password.util');
const tokenUtil = require('../../../utils/token.util');

class AuthService {
  async inscription(inscriptionDto) {
    const existe = await authRepository.trouverParEmailOuTelephone(inscriptionDto.telephone);
    if (existe) {
        throw new Error("Un compte UniPay est déjà configuré avec ces coordonnées.");
    }

    const geo = currencyHelper.detecterParTelephone(inscriptionDto.telephone);
    inscriptionDto.motDePasse = await passwordUtil.hacher(inscriptionDto.motDePasse);

    const util = await authRepository.creerUtilisateurEtPortefeuille(inscriptionDto, geo.pays);
    const token = tokenUtil.genererAcessToken(util.id, util.role);

    return { 
        token, 
        utilisateur: { 
            id: util.id, 
            nom: util.nom, 
            pays: util.pays, 
            devise: geo.devise 
        } 
    };
  }

  async connexion(connexionDto) {
    // console.log("=== DEBUG LOGIN ===", connexionDto);
    const util = await authRepository.trouverParEmailOuTelephone(connexionDto.identifiant);
    // console.log("Utilisateur trouvé en BDD ?", util ? "OUI" : "NON");
    if (!util) {
        throw new Error("Identifiants de connexion invalides.");
    }

    const valide = await passwordUtil.comparer(connexionDto.motDePasse, util.motDePasse);
    if (!valide) {
        throw new Error("Identifiants de connexion invalides.");
    }

    const geo = currencyHelper.detecterParTelephone(util.telephone);
    const token = tokenUtil.genererAcessToken(util.id, util.role);

    return { 
        token, 
        utilisateur: { 
            id: util.id, 
            nom: util.nom, 
            pays: util.pays, 
            devise: geo.devise 
        } 
    };
  }

  async demandeMotDePasseOublie(email) {
    const util = await authRepository.trouverParEmailOuTelephone(email);
    if (!util) {
        throw new Error("Si cet email existe, un token de récupération lui a été attribué.");
    }

    const { tokenBrut, expiration } = tokenUtil.genererResetTokenOpaque();
    await authRepository.mettreAJourChampsReset(util.id, tokenBrut, expiration);

    // Dans un environnement de production, ce token est envoyé par email. Nous le retournons pour le MVP.
    return { 
        resetToken: tokenBrut, 
        message: "Le token de réinitialisation a été généré avec succès." 
    };
  }

  async executerRéinitialisation(passwordResetDto) {
    const util = await authRepository.trouverParResetToken(passwordResetDto.token);
    if (!util) {
        throw new Error("Le jeton de récupération est invalide ou a expiré.");
    }

    const mdpHache = await passwordUtil.hacher(passwordResetDto.nouveauMotDePasse);
    await authRepository.reinitialiserMotDePasse(util.id, mdpHache);

    return { 
        message: "Votre mot de passe UniPay a été modifié avec succès." 
    };
  }

  /**
   * 🆕 INITIALISATION DU CODE PIN
   */
  async configurerPremierPIN(utilisateurId, nouveauPin) {
    if (!/^\d{4}$/.test(nouveauPin)) {
      throw new Error("Le code PIN doit être composé de exactement 4 chiffres.");
    }

    // 🔥 On passe par le repository
    const utilisateur = await utilisateurRepository.trouverParId(utilisateurId);
    if (!utilisateur) throw new Error("Utilisateur introuvable.");
    if (utilisateur.codePIN) throw new Error("Un code PIN existe déjà.");

    const pinHashe = await bcrypt.hash(nouveauPin, 10);

    // 🔥 On délègue la sauvegarde au repository
    await utilisateurRepository.mettreAJourPin(utilisateurId, pinHashe);

    return { message: "Votre code PIN a été configuré avec succès." };
  }

  /**
   * 🔄 MODIFICATION DU CODE PIN
   */
  async modifierPINExistant(utilisateurId, ancienPin, nouveauPin) {
    if (!/^\d{4}$/.test(nouveauPin)) {
      throw new Error("Le nouveau code PIN doit contenir 4 chiffres.");
    }

    // 🔥 On passe par le repository
    const utilisateur = await utilisateurRepository.trouverParId(utilisateurId);
    if (!utilisateur || !utilisateur.codePIN) {
      throw new Error("Aucun code PIN configuré pour ce compte.");
    }

    const ancienPinValide = await bcrypt.compare(ancienPin, utilisateur.codePIN);
    if (!ancienPinValide) {
      throw new Error("L'ancien code PIN saisi est incorrect.");
    }

    const nouveauPinHashe = await bcrypt.hash(nouveauPin, 10);

    // 🔥 On délègue la mise à jour au repository
    await utilisateurRepository.mettreAJourPin(utilisateurId, nouveauPinHashe);

    return { message: "Votre code PIN a été modifié avec succès." };
  }
}

module.exports = new AuthService();