class SimulateurProvider {
  constructor(agregateur) {
    this.id = agregateur.id;
    this.nom = agregateur.nom;
    this.type = agregateur.type;
  }

  /**
   * 📲 SIMULATION D'UN CASH-IN (DÉPÔT)
   */
  async encaisserDepot(telephone, montant, reference) {
    console.log(`\n🔌 [SANDBOX - ${this.nom}] --- DEMANDE DE DÉPÔT EN COURS ---`);
    console.log(`📍 Via Passerelle : ${this.type} | Réf UniPay: ${reference}`);
    console.log(`📱 Envoi du Push PUSH OTP / Demande de PIN vers : ${telephone}`);
    console.log(`💵 Montant total à valider sur le mobile : ${montant.toFixed(2)}`);

    // Simulation anti-fraude locale sur ton environnement de test :
    // Si le numéro finit par '00', on simule un échec (solde insuffisant, rejet client, etc.)
    if (telephone.endsWith('00')) {
      console.log(`❌ [SANDBOX - ${this.nom}] Transaction déclinée par l'opérateur.`);
      return {
        statutOperateur: "ECHEC",
        motif: "SOLDE_INSUFFISANT_OU_TIMEOUT"
      };
    }

    console.log(`✅ [SANDBOX - ${this.nom}] Le client a saisi son PIN. Paiement Validé !`);
    return {
      statutOperateur: "SUCCES",
      motif: null,
      transactionIdExterne: `TX_GATEWAY_${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  }

  /**
   * 🏧 SIMULATION D'UN CASH-OUT (RETRAIT)
   */
  async envoyerRetrait(telephone, montant, reference) {
    console.log(`\n🔌 [SANDBOX - ${this.nom}] --- DEMANDE DE RETRAIT (PAYOUT) ---`);
    console.log(`📍 Via Passerelle : ${this.type} | Réf UniPay: ${reference}`);
    console.log(`💸 Virement automatique vers le compte Mobile Money : ${telephone}`);
    console.log(`💵 Montant net envoyé : ${montant.toFixed(2)}`);

    if (telephone.endsWith('00')) {
      console.log(`❌ [SANDBOX - ${this.nom}] Virement rejeté par le réseau télécom.`);
      return {
        statutOperateur: "ECHEC",
        motif: "COMPTE_DESTINATION_BLOQUE"
      };
    }

    console.log(`✅ [SANDBOX - ${this.nom}] Portefeuille mobile crédité avec succès.`);
    return {
      statutOperateur: "SUCCES",
      motif: null
    };
  }
}

module.exports = SimulateurProvider;