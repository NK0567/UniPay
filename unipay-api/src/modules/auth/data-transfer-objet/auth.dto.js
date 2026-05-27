class InscriptionDto {
  constructor(data) {
    this.nom = data.nom ? data.nom.trim().toUpperCase() : null;
    this.prenom = data.prenom ? data.prenom.trim() : null;
    this.email = data.email ? data.email.trim().toLowerCase() : null;
    this.telephone = data.telephone ? data.telephone.trim().replace(/\s+/g, '') : null;
    this.motDePasse = data.motDePasse;
  }
}

class ConnexionDto {
  constructor(data) {
    this.identifiant = data.identifiant ? data.identifiant.trim() : null; // Email ou Téléphone
    this.motDePasse = data.motDePasse;
  }
}

class PasswordResetDto {
  constructor(data) {
    this.token = data.token ? data.token.trim() : null;
    this.nouveauMotDePasse = data.nouveauMotDePasse;
  }
}

module.exports = { InscriptionDto, ConnexionDto, PasswordResetDto };