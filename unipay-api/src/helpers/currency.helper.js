class CurrencyHelper {
  constructor() {
    // Registre mondial UniPay : 30 pays avec codes ISO (Char(2)) et devises ISO (Char(3))
    this.prefixRegistry = {

      // =========================
      // AFRIQUE
      // =========================

      "237": { pays: "CM", devise: "XAF" }, // Cameroun
      "241": { pays: "GA", devise: "XAF" }, // Gabon
      "242": { pays: "CG", devise: "XAF" }, // Congo
      "236": { pays: "CF", devise: "XAF" }, // RCA
      "235": { pays: "TD", devise: "XAF" }, // Tchad
      "240": { pays: "GQ", devise: "XAF" }, // Guinée Équatoriale

      "221": { pays: "SN", devise: "XOF" }, // Sénégal
      "225": { pays: "CI", devise: "XOF" }, // Côte d'Ivoire
      "228": { pays: "TG", devise: "XOF" }, // Togo
      "229": { pays: "BJ", devise: "XOF" }, // Bénin
      "223": { pays: "ML", devise: "XOF" }, // Mali
      "226": { pays: "BF", devise: "XOF" }, // Burkina Faso
      "227": { pays: "NE", devise: "XOF" }, // Niger
      "224": { pays: "GN", devise: "GNF" }, // Guinée
      "220": { pays: "GM", devise: "GMD" }, // Gambie

      "234": { pays: "NG", devise: "NGN" }, // Nigeria
      "233": { pays: "GH", devise: "GHS" }, // Ghana
      "254": { pays: "KE", devise: "KES" }, // Kenya
      "255": { pays: "TZ", devise: "TZS" }, // Tanzanie
      "256": { pays: "UG", devise: "UGX" }, // Ouganda
      "250": { pays: "RW", devise: "RWF" }, // Rwanda
      "257": { pays: "BI", devise: "BIF" }, // Burundi

      "27": { pays: "ZA", devise: "ZAR" },  // Afrique du Sud
      "258": { pays: "MZ", devise: "MZN" }, // Mozambique
      "260": { pays: "ZM", devise: "ZMW" }, // Zambie
      "263": { pays: "ZW", devise: "USD" }, // Zimbabwe
      "264": { pays: "NA", devise: "NAD" }, // Namibie
      "267": { pays: "BW", devise: "BWP" }, // Botswana
      "268": { pays: "SZ", devise: "SZL" }, // Eswatini
      "261": { pays: "MG", devise: "MGA" }, // Madagascar
      "230": { pays: "MU", devise: "MUR" }, // Maurice

      "212": { pays: "MA", devise: "MAD" }, // Maroc
      "213": { pays: "DZ", devise: "DZD" }, // Algérie
      "216": { pays: "TN", devise: "TND" }, // Tunisie
      "20": { pays: "EG", devise: "EGP" }, // Égypte
      "218": { pays: "LY", devise: "LYD" }, // Libye

      "251": { pays: "ET", devise: "ETB" }, // Éthiopie
      "252": { pays: "SO", devise: "SOS" }, // Somalie
      "249": { pays: "SD", devise: "SDG" }, // Soudan

      // =========================
      // EUROPE
      // =========================

      "33": { pays: "FR", devise: "EUR" }, // France
      "49": { pays: "DE", devise: "EUR" }, // Allemagne
      "32": { pays: "BE", devise: "EUR" }, // Belgique
      "39": { pays: "IT", devise: "EUR" }, // Italie
      "34": { pays: "ES", devise: "EUR" }, // Espagne
      "351": { pays: "PT", devise: "EUR" }, // Portugal
      "31": { pays: "NL", devise: "EUR" }, // Pays-Bas
      "43": { pays: "AT", devise: "EUR" }, // Autriche
      "353": { pays: "IE", devise: "EUR" }, // Irlande
      "352": { pays: "LU", devise: "EUR" }, // Luxembourg
      "30": { pays: "GR", devise: "EUR" }, // Grèce
      "358": { pays: "FI", devise: "EUR" }, // Finlande

      "41": { pays: "CH", devise: "CHF" }, // Suisse
      "44": { pays: "GB", devise: "GBP" }, // Royaume-Uni
      "46": { pays: "SE", devise: "SEK" }, // Suède
      "47": { pays: "NO", devise: "NOK" }, // Norvège
      "45": { pays: "DK", devise: "DKK" }, // Danemark
      "48": { pays: "PL", devise: "PLN" }, // Pologne
      "420": { pays: "CZ", devise: "CZK" }, // République Tchèque
      "36": { pays: "HU", devise: "HUF" }, // Hongrie
      "40": { pays: "RO", devise: "RON" }, // Roumanie
      "380": { pays: "UA", devise: "UAH" }, // Ukraine
      "7": { pays: "RU", devise: "RUB" }, // Russie

      // =========================
      // AMÉRIQUES
      // =========================

      "1": { pays: "US", devise: "USD" }, // USA / Canada
      "52": { pays: "MX", devise: "MXN" }, // Mexique
      "55": { pays: "BR", devise: "BRL" }, // Brésil
      "54": { pays: "AR", devise: "ARS" }, // Argentine
      "56": { pays: "CL", devise: "CLP" }, // Chili
      "57": { pays: "CO", devise: "COP" }, // Colombie
      "51": { pays: "PE", devise: "PEN" }, // Pérou
      "58": { pays: "VE", devise: "VES" }, // Venezuela
      "593": { pays: "EC", devise: "USD" }, // Équateur
      "595": { pays: "PY", devise: "PYG" }, // Paraguay
      "598": { pays: "UY", devise: "UYU" }, // Uruguay
      "591": { pays: "BO", devise: "BOB" }, // Bolivie

      // =========================
      // ASIE
      // =========================

      "86": { pays: "CN", devise: "CNY" }, // Chine
      "81": { pays: "JP", devise: "JPY" }, // Japon
      "82": { pays: "KR", devise: "KRW" }, // Corée du Sud
      "91": { pays: "IN", devise: "INR" }, // Inde
      "92": { pays: "PK", devise: "PKR" }, // Pakistan
      "880": { pays: "BD", devise: "BDT" }, // Bangladesh
      "94": { pays: "LK", devise: "LKR" }, // Sri Lanka
      "977": { pays: "NP", devise: "NPR" }, // Népal

      "62": { pays: "ID", devise: "IDR" }, // Indonésie
      "60": { pays: "MY", devise: "MYR" }, // Malaisie
      "65": { pays: "SG", devise: "SGD" }, // Singapour
      "66": { pays: "TH", devise: "THB" }, // Thaïlande
      "63": { pays: "PH", devise: "PHP" }, // Philippines
      "84": { pays: "VN", devise: "VND" }, // Vietnam

      // =========================
      // MOYEN-ORIENT
      // =========================

      "971": { pays: "AE", devise: "AED" }, // UAE
      "966": { pays: "SA", devise: "SAR" }, // Arabie Saoudite
      "974": { pays: "QA", devise: "QAR" }, // Qatar
      "965": { pays: "KW", devise: "KWD" }, // Koweït
      "968": { pays: "OM", devise: "OMR" }, // Oman
      "973": { pays: "BH", devise: "BHD" }, // Bahreïn
      "964": { pays: "IQ", devise: "IQD" }, // Irak
      "98": { pays: "IR", devise: "IRR" }, // Iran
      "90": { pays: "TR", devise: "TRY" }, // Turquie
      "972": { pays: "IL", devise: "ILS" }, // Israël

      // =========================
      // OCÉANIE
      // =========================

      "61": { pays: "AU", devise: "AUD" }, // Australie
      "64": { pays: "NZ", devise: "NZD" }, // Nouvelle-Zélande
      "679": { pays: "FJ", devise: "FJD" } // Fidji
    };

    this.tauxStatiques = {

      // =========================
      // ZONES CFA
      // =========================
      "XAF_XAF": 1.0, "XOF_XOF": 1.0, "XAF_XOF": 1.0, "XOF_XAF": 1.0,

      // =========================
      // USD / EUR / GBP
      // =========================
      "USD_USD": 1.0, "EUR_EUR": 1.0, "GBP_GBP": 1.0, "USD_EUR": 0.93, "EUR_USD": 1.08, "GBP_USD": 1.27, "GBP_EUR": 1.17,
      "EUR_GBP": 0.85, "USD_GBP": 0.79,

      // =========================
      // EUROPE
      // =========================
      "CHF_XAF": 670.15, "CHF_USD": 1.12, "CHF_EUR": 1.04, "SEK_XAF": 56.20, "SEK_USD": 0.091, "NOK_XAF": 57.90, "NOK_USD": 0.093,
      "DKK_XAF": 88.10, "DKK_EUR": 0.13, "PLN_XAF": 152.60, "PLN_USD": 0.25, "CZK_XAF": 26.80, "CZK_USD": 0.043, "HUF_XAF": 1.67,

      "HUF_USD": 0.0027, "RON_XAF": 132.90, "RON_USD": 0.22, "RUB_XAF": 6.75, "RUB_USD": 0.011, "TRY_XAF": 18.40, "TRY_USD": 0.031,

      // =========================
      // AFRIQUE
      // =========================
      "NGN_XAF": 0.40, "GHS_XAF": 41.50, "ZAR_XAF": 32.80, "MAD_XAF": 60.50, "KES_XAF": 4.65, "EGP_XAF": 12.30, "DZD_XAF": 4.50,
      "TND_XAF": 198.20, "UGX_XAF": 0.16, "TZS_XAF": 0.24, "RWF_XAF": 0.47, "BWP_XAF": 44.60, "MUR_XAF": 13.10, "ETB_XAF": 4.90,

      // =========================
      // AMÉRIQUES
      // =========================
      "USD_XAF": 610.25, "USD_XOF": 610.25, "CAD_XAF": 445.20, "CAD_USD": 0.73, "MXN_XAF": 35.90, "MXN_USD": 0.058, "BRL_XAF": 118.20,
      "BRL_USD": 0.19, "ARS_XAF": 0.72, "ARS_USD": 0.0011, "COP_XAF": 0.15, "COP_USD": 0.00024, "CLP_XAF": 0.64, "CLP_USD": 0.0010,

      "PEN_XAF": 164.70, "PEN_USD": 0.27, "UYU_XAF": 15.50, "UYU_USD": 0.026, "BOB_XAF": 88.10, "BOB_USD": 0.14, "PYG_XAF": 0.082,
      "PYG_USD": 0.00013,

      // =========================
      // ASIE
      // =========================
      "CNY_XAF": 84.10, "CNY_USD": 0.14, "JPY_XAF": 3.85, "JPY_USD": 0.0063, "INR_XAF": 7.30, "INR_USD": 0.012, "KRW_XAF": 0.45,
      "KRW_USD": 0.00073, "SGD_XAF": 452.80, "SGD_USD": 0.74, "HKD_XAF": 77.90, "HKD_USD": 0.13, "TWD_XAF": 18.70, "TWD_USD": 0.031,

      "THB_XAF": 16.80, "THB_USD": 0.028, "MYR_XAF": 130.40, "MYR_USD": 0.21, "IDR_XAF": 0.038, "IDR_USD": 0.000062, "VND_XAF": 0.024,
      "VND_USD": 0.000039, "PHP_XAF": 10.70, "PHP_USD": 0.018, "PKR_XAF": 2.18, "PKR_USD": 0.0035, "BDT_XAF": 5.55, "BDT_USD": 0.0091,

      "LKR_XAF": 2.01, "LKR_USD": 0.0033,

      // =========================
      // MOYEN-ORIENT
      // =========================
      "AED_XAF": 166.10, "AED_USD": 0.27, "SAR_XAF": 162.70, "SAR_USD": 0.26, "QAR_XAF": 167.90, "QAR_USD": 0.27,
      "KWD_XAF": 1985.50, "KWD_USD": 3.25, "BHD_XAF": 1610.40, "BHD_USD": 2.65, "OMR_XAF": 1580.70, "OMR_USD": 2.60,

      "ILS_XAF": 171.80, "ILS_USD": 0.28, "JOD_XAF": 860.90, "JOD_USD": 1.41,

      // =========================
      // OCÉANIE
      // =========================
      "AUD_XAF": 402.70, "AUD_USD": 0.66, "NZD_XAF": 370.40, "NZD_USD": 0.61, "FJD_XAF": 268.20, "FJD_USD": 0.44,

      // =========================
      // CRYPTO (tests éventuels)
      // =========================
      "BTC_USD": 108000.00, "ETH_USD": 5200.00, "USDT_USD": 1.0,

      // =========================
      // ÉQUIVALENCES DIRECTES
      // =========================
      "CAD_CAD": 1.0, "CHF_CHF": 1.0, "JPY_JPY": 1.0, "CNY_CNY": 1.0, "INR_INR": 1.0, "NGN_NGN": 1.0, "GHS_GHS": 1.0, "ZAR_ZAR": 1.0,
      "MAD_MAD": 1.0, "KES_KES": 1.0, "AUD_AUD": 1.0, "AED_AED": 1.0, "SAR_SAR": 1.0, "BRL_BRL": 1.0, "MXN_MXN": 1.0
    };

    // 🔗 Changement ici : Attacher à "this" pour la portée globale de la classe
    this.cartographiePays = {

      // =========================
      // AFRIQUE
      // =========================
      cameroun: { code: 'CM', devise: 'XAF', synonymes: ['cmr', 'cameroon', 'kameroun', 'camerounais'] },
      gabon: { code: 'GA', devise: 'XAF', synonymes: ['gabonais', 'ga', 'gabon'] },
      congo: { code: 'CG', devise: 'XAF', synonymes: ['cg', 'congo-brazzaville', 'congolais'] },
      tchad: { code: 'TD', devise: 'XAF', synonymes: ['td', 'chad', 'tchadien'] },
      'république centrafricaine': { code: 'CF', devise: 'XAF', synonymes: ['rca', 'central african republic', 'cf'] },
      sénégal: { code: 'SN', devise: 'XOF', synonymes: ['senegal', 'sn', 'sénégalais'] },
      mali: { code: 'ML', devise: 'XOF', synonymes: ['ml', 'malien'] },
      bénin: { code: 'BJ', devise: 'XOF', synonymes: ['benin', 'bj', 'béninois'] },
      togo: { code: 'TG', devise: 'XOF', synonymes: ['tg', 'togolais'] },
      'burkina faso': { code: 'BF', devise: 'XOF', synonymes: ['bf', 'burkina', 'burkinabé'] },
      niger: { code: 'NE', devise: 'XOF', synonymes: ['ne', 'nigerien', 'nigérien'] },
      guinée: { code: 'GN', devise: 'GNF', synonymes: ['guinea', 'gn', 'guinéen'] },
      'côte d\'ivoire': { code: 'CI', devise: 'XOF', synonymes: ['cote d\'ivoire', 'ci', 'ivoire', 'ivoirien'] },
      nigéria: { code: 'NG', devise: 'NGN', synonymes: ['nigeria', 'ng', 'nigérian'] },
      ghana: { code: 'GH', devise: 'GHS', synonymes: ['gh', 'ghanéen'] },
      kenya: { code: 'KE', devise: 'KES', synonymes: ['ke', 'kenyan'] },
      ouganda: { code: 'UG', devise: 'UGX', synonymes: ['ugandais', 'ug'] },
      tanzanie: { code: 'TZ', devise: 'TZS', synonymes: ['tz', 'tanzanien'] },
      rwanda: { code: 'RW', devise: 'RWF', synonymes: ['rw', 'rwandais'] },
      burundi: { code: 'BI', devise: 'BIF', synonymes: ['bi', 'burundais'] },
      'afrique du sud': { code: 'ZA', devise: 'ZAR', synonymes: ['south africa', 'za', 'sud-africain'] },
      algérie: { code: 'DZ', devise: 'DZD', synonymes: ['dz', 'algeria', 'algérien'] },
      maroc: { code: 'MA', devise: 'MAD', synonymes: ['morocco', 'ma', 'marocain'] },
      tunisie: { code: 'TN', devise: 'TND', synonymes: ['tunisia', 'tn', 'tunisien'] },
      égypte: { code: 'EG', devise: 'EGP', synonymes: ['egypt', 'eg', 'égyptien'] },
      éthiopie: { code: 'ET', devise: 'ETB', synonymes: ['ethiopia', 'et', 'éthiopien'] },

      // =========================
      // EUROPE
      // =========================
      france: { code: 'FR', devise: 'EUR', synonymes: ['fr', 'french', 'français', 'france'] },
      belgique: { code: 'BE', devise: 'EUR', synonymes: ['be', 'belgium', 'belge'] },
      allemagne: { code: 'DE', devise: 'EUR', synonymes: ['germany', 'de', 'deutschland', 'allemand'] },
      espagne: { code: 'ES', devise: 'EUR', synonymes: ['spain', 'es', 'espana', 'espagnol'] },
      italie: { code: 'IT', devise: 'EUR', synonymes: ['italy', 'it', 'italien'] },
      portugal: { code: 'PT', devise: 'EUR', synonymes: ['pt', 'portugalais'] },
      paysbas: { code: 'NL', devise: 'EUR', synonymes: ['netherlands', 'hollande', 'néerlandais'] },
      suisse: { code: 'CH', devise: 'CHF', synonymes: ['ch', 'switzerland', 'swiss', 'suisses'] },
      autriche: { code: 'AT', devise: 'EUR', synonymes: ['austria', 'at', 'autrichien'] },
      suède: { code: 'SE', devise: 'SEK', synonymes: ['sweden', 'se', 'suédois'] },
      norvège: { code: 'NO', devise: 'NOK', synonymes: ['norway', 'no', 'norvégien'] },
      danemark: { code: 'DK', devise: 'DKK', synonymes: ['denmark', 'dk', 'danois'] },
      pologne: { code: 'PL', devise: 'PLN', synonymes: ['poland', 'pl', 'polonais'] },
      russie: { code: 'RU', devise: 'RUB', synonymes: ['russia', 'ru', 'russe'] },
      ukraine: { code: 'UA', devise: 'UAH', synonymes: ['ukraine', 'ua', 'ukrainien'] },
      'royaume-uni': { code: 'GB', devise: 'GBP', synonymes: ['uk', 'united kingdom', 'gb', 'angleterre', 'anglais'] },

      // =========================
      // AMÉRIQUES
      // =========================
      canada: { code: 'CA', devise: 'CAD', synonymes: ['can', 'canadien'] },
      'états-unis': { code: 'US', devise: 'USD', synonymes: ['usa', 'us', 'united states', 'america', 'amérique', 'américain'] },
      mexique: { code: 'MX', devise: 'MXN', synonymes: ['mexico', 'mx', 'mexicain'] },
      brésil: { code: 'BR', devise: 'BRL', synonymes: ['brazil', 'br', 'brésilien'] },
      argentine: { code: 'AR', devise: 'ARS', synonymes: ['argentina', 'ar', 'argentin'] },
      chili: { code: 'CL', devise: 'CLP', synonymes: ['chile', 'cl', 'chilien'] },
      colombie: { code: 'CO', devise: 'COP', synonymes: ['colombia', 'co', 'colom'] },
      pérou: { code: 'PE', devise: 'PEN', synonymes: ['peru', 'pe', 'péruvien'] },

      // =========================
      // ASIE
      // =========================
      chine: { code: 'CN', devise: 'CNY', synonymes: ['china', 'cn', 'chinois'] },
      japon: { code: 'JP', devise: 'JPY', synonymes: ['japan', 'jp', 'japonais'] },
      inde: { code: 'IN', devise: 'INR', synonymes: ['india', 'in', 'indien'] },
      pakistan: { code: 'PK', devise: 'PKR', synonymes: ['pakistan', 'pk', 'pakistanais'] },
      bangladesh: { code: 'BD', devise: 'BDT', synonymes: ['bd', 'bangladais'] },
      corée: { code: 'KR', devise: 'KRW', synonymes: ['south korea', 'kr', 'coréen'] },
      singapour: { code: 'SG', devise: 'SGD', synonymes: ['sg', 'singapore'] },
      malaisie: { code: 'MY', devise: 'MYR', synonymes: ['my', 'malaysian'] },
      indonésie: {code: 'ID', devise: 'IDR', synonymes: ['id', 'indonesian'] },
      thaïlande: { code: 'TH', devise: 'THB', synonymes: ['thailand', 'th', 'thaïlandais'] },
      vietnam: { code: 'VN', devise: 'VND', synonymes: ['vn', 'vietnamien'] },

      // =========================
      // MOYEN-ORIENT
      // =========================

      'émirats arabes unis': { code: 'AE', devise: 'AED', synonymes: ['uae', 'dubai', 'ae', 'émirats'] },
      'arabie saoudite': { code: 'SA', devise: 'SAR', synonymes: ['saudi arabia', 'sa', 'saoudien']},
      qatar: { code: 'QA', devise: 'QAR', synonymes: ['qa', 'qatari']},
      koweit: { code: 'KW', devise: 'KWD', synonymes: ['kuwait', 'kw']},
      israël: { code: 'IL', devise: 'ILS',synonymes: ['israel', 'il', 'israélien']},
      turquie: {code: 'TR',devise: 'TRY',synonymes: ['turkey', 'tr', 'turc']},

      // =========================
      // OCÉANIE
      // =========================
      australie: {code: 'AU',devise: 'AUD',synonymes: ['australia', 'au', 'australi']},
      'nouvelle-zélande': {code: 'NZ',devise: 'NZD',synonymes: ['new zealand', 'nz', 'néo-zélandais']}
    };
  }

  detecterParTelephone(telephone) {
    if (!telephone) throw new Error("Le numéro de téléphone est obligatoire.");
    const cleanNumber = telephone.replace(/\D/g, "");
    const prefixes = Object.keys(this.prefixRegistry).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
      if (cleanNumber.startsWith(prefix)) return this.prefixRegistry[prefix];
    }
    throw new Error("Cet indicatif téléphonique n'est pas encore couvert par UniPay.");
  }

  obtenirTauxStatique(deviseSource, deviseCible) {
    const src = deviseSource.toUpperCase();
    const cbl = deviseCible.toUpperCase();
    if (src === cbl) return 1.0;
    const cle = `${src}_${cbl}`;
    if (this.tauxStatiques[cle]) return this.tauxStatiques[cle];
    const cleInverse = `${cbl}_${src}`;
    if (this.tauxStatiques[cleInverse]) return 1 / this.tauxStatiques[cleInverse];
    throw new Error(`Taux de change indisponible entre ${src} et ${cbl}`);
  }

  extraireDeviseParNomPays(texteLePays) {
    const paysNettoye = texteLePays.toLowerCase().trim();
    for (const [nomPays, config] of Object.entries(this.cartographiePays)) {
      if (paysNettoye === nomPays || config.synonymes.includes(paysNettoye)) {
        return config.devise;
      }
    }
    return null;
  }

  getNomPaysParDevise(devise) {
    const dev = typeof devise === 'string' ? devise.toUpperCase() : '';
    for (const [nomPays, config] of Object.entries(this.cartographiePays)) {
      if (config.devise === dev) return nomPays.charAt(0).toUpperCase() + nomPays.slice(1);
    }
    return dev;
  }

  // Helper pour retourner toutes les devises ISO distinctes gérées dans ton dictionnaire
  getDevisesSupportees() {
    const devises = Object.values(this.cartographiePays).map(config => config.devise);
    return [...new Set(devises)];
  }

  // Politique de frais de transfert standard d'UniPay (Frais fixes ou % simulés)
  calculerFraisSimules(montant, devise) {
    // Exemple de frais transparents : 1.5% du montant
    return parseFloat((montant * 0.015).toFixed(2));
  }

    // 💱 Conversion intelligente de devise UniPay
  convertir(montant, deviseSource, deviseCible) {
    if (montant === undefined || montant === null || isNaN(montant)) {
      throw new Error("Le montant à convertir est invalide.");
    }
    if (!deviseSource || !deviseCible) {
      throw new Error("Les devises source et cible sont obligatoires.");
    }
    const source = deviseSource.toUpperCase().trim();
    const cible = deviseCible.toUpperCase().trim();
    if (source === cible) {
      return {
        montantOriginal: Number(montant),
        deviseSource: source,
        deviseCible: cible,
        taux: 1,
        montantConverti: Number(parseFloat(montant).toFixed(2)),
        conversionDirecte: true
      };
    }
    try {
      const taux = this.obtenirTauxStatique(source, cible);
      const montantConverti = parseFloat(
        (Number(montant) * taux).toFixed(2)
      );
      return {
        montantOriginal: Number(montant),
        deviseSource: source,
        deviseCible: cible,
        taux,
        montantConverti,
        conversionDirecte: true
      };
    } catch (error) {
      try {
        const tauxVersUSD = this.obtenirTauxStatique(source, "USD");
        const tauxUSDVersCible = this.obtenirTauxStatique("USD", cible);
        const montantUSD = Number(montant) * tauxVersUSD;
        const montantFinal = parseFloat(
          (montantUSD * tauxUSDVersCible).toFixed(2)
        );
        const tauxGlobal = parseFloat(
          (tauxVersUSD * tauxUSDVersCible).toFixed(6)
        );
        return {
          montantOriginal: Number(montant),
          deviseSource: source,
          deviseCible: cible,
          taux: tauxGlobal,
          montantConverti: montantFinal,
          conversionDirecte: false,
          deviseIntermediaire: "USD"
        };
      } catch (fallbackError) {
        throw new Error(
          `Conversion indisponible entre ${source} et ${cible}.`
        );
      }
    }
  } //
}

module.exports = new CurrencyHelper();