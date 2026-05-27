class CurrencyHelper {
  constructor() {
    // Registre mondial UniPay : 30 pays avec codes ISO (Char(2)) et devises ISO (Char(3))
    this.prefixRegistry = {
      // --- AFRIQUE (CEMAC - XAF) ---
      "237": { pays: "CM", devise: "XAF" }, // Cameroun
      "241": { pays: "GA", devise: "XAF" }, // Gabon
      "242": { pays: "CG", devise: "XAF" }, // Congo
      "236": { pays: "CF", devise: "XAF" }, // Centrafrique
      "235": { pays: "TD", devise: "XAF" }, // Tchad

      // --- AFRIQUE (UEMOA - XOF) ---
      "221": { pays: "SN", devise: "XOF" }, // Sénégal
      "225": { pays: "CI", devise: "XOF" }, // Côte d'Ivoire
      "228": { pays: "TG", devise: "XOF" }, // Togo
      "229": { pays: "BJ", devise: "XOF" }, // Bénin
      "223": { pays: "ML", devise: "XOF" }, // Mali
      "226": { pays: "BF", devise: "XOF" }, // Burkina Faso

      // --- AFRIQUE (Hors zone franc) ---
      "234": { pays: "NG", devise: "NGN" }, // Nigeria
      "233": { pays: "GH", devise: "GHS" }, // Ghana
      "254": { pays: "KE", devise: "KES" }, // Kenya
      "27":  { pays: "ZA", devise: "ZAR" }, // Afrique du Sud
      "212": { pays: "MA", devise: "MAD" }, // Maroc

      // --- EUROPE ---
      "33":  { pays: "FR", devise: "EUR" }, // France
      "49":  { pays: "DE", devise: "EUR" }, // Allemagne
      "32":  { pays: "BE", devise: "EUR" }, // Belgique
      "39":  { pays: "IT", devise: "EUR" }, // Italie
      "34":  { pays: "ES", devise: "EUR" }, // Espagne
      "41":  { pays: "CH", devise: "CHF" }, // Suisse
      "44":  { pays: "GB", devise: "GBP" }, // Royaume-Uni

      // --- AMÉRIQUES ---
      "1":   { pays: "US", devise: "USD" }, // USA / Canada
      "55":  { pays: "BR", devise: "BRL" }, // Brésil
      "52":  { pays: "MX", devise: "MXN" }, // Mexique

      // --- ASIE / MOYEN-ORIENT ---
      "86":  { pays: "CN", devise: "CNY" }, // Chine
      "81":  { pays: "JP", devise: "JPY" }, // Japon
      "91":  { pays: "IN", devise: "INR" }, // Inde
      "971": { pays: "AE", devise: "AED" }, // Émirats Arabes Unis
      "966": { pays: "SA", devise: "SAR" }  // Arabie Saoudite
    };

    // Table des taux de change (Base de simulation statique)
    this.tauxStatiques = {
      "EUR_XAF": 655.95, "EUR_XOF": 655.95,
      "USD_XAF": 610.25, "USD_XOF": 610.25,
      "GBP_XAF": 775.50, "GBP_XOF": 775.50,
      "CHF_XAF": 670.15,
      "CNY_XAF": 84.10,  "CNY_USD": 0.14,
      "JPY_XAF": 3.85,   "JPY_USD": 0.0063,
      "INR_XAF": 7.30,   "INR_USD": 0.012,
      "AED_XAF": 166.10, "AED_USD": 0.27,
      "SAR_XAF": 162.70, "SAR_USD": 0.26,
      "NGN_XAF": 0.40,
      "GHS_XAF": 41.50,
      "ZAR_XAF": 32.80,
      "MAD_XAF": 60.50,
      "KES_XAF": 4.65,
      "BRL_XAF": 118.20, "BRL_USD": 0.19,
      "MXN_XAF": 35.90,  "MXN_USD": 0.058,
      "USD_EUR": 0.93,
      "EUR_USD": 1.08,
      "GBP_EUR": 1.17,
      "XAF_XOF": 1.0,
      "XOF_XAF": 1.0,
      "XAF_XAF": 1.0,
      "XOF_XOF": 1.0,
      "USD_USD": 1.0,
      "EUR_EUR": 1.0
    };
  }

  detecterParTelephone(telephone) {
    if (!telephone) {
      throw new Error("Le numéro de téléphone est obligatoire.");
    }
    const cleanNumber = telephone.replace(/\D/g, "");
    const prefixes = Object.keys(this.prefixRegistry).sort((a, b) => b.length - a.length);

    for (const prefix of prefixes) {
      if (cleanNumber.startsWith(prefix)) {
        return this.prefixRegistry[prefix];
      }
    }
    throw new Error("Cet indicatif téléphonique n'est pas encore couvert par le réseau mondial UniPay.");
  }

  obtenirTauxStatique(deviseSource, deviseCible) {
    if (deviseSource === deviseCible) {
      return 1.0;
    }
    const cle = `${deviseSource}_${deviseCible}`;
    if (this.tauxStatiques[cle]) {
      return this.tauxStatiques[cle];
    }
    const cleInverse = `${deviseCible}_${deviseSource}`;
    if (this.tauxStatiques[cleInverse]) {
      return 1 / this.tauxStatiques[cleInverse];
    }
    throw new Error(`Taux de change introuvable pour la paire ${deviseSource}_${deviseCible}`);
  }
}

module.exports = new CurrencyHelper();