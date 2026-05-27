// const axios = require('axios');

// class CountryService{
//     async getCurrencyByCountry(countryName){
//         const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);

//         const country = response.data[0];

//         if(!country.currencies){
//             throw new Error(`Devise introuvable pour ${countryName}`)
//         }

//         // récupère automatiquement la premèire devise
//         const currencyCode = Object.keys(country.currencies)[0];

//         return currencyCode;
//     }
// }

// module.exports = new CountryService();

class CountryService {
    constructor() {
        // Dictionnaire immuable des pays officiellement supportés par UniPay (Sections 5, 19 & 21)
        this.countriesData = {
            "CAMEROUN": "XAF",
            "CAMEROON": "XAF",
            "CM": "XAF",
            
            "COTE D'IVOIRE": "XAF",
            "CI": "XAF",
            
            "SENEGAL": "XAF",
            "SN": "XAF",
            
            "GABON": "XAF",
            "GA": "XAF",
            
            "TOGO": "XAF",
            "TG": "XAF",
            
            "FRANCE": "EUR",
            "FR": "EUR",
            
            "UNITED STATES": "USD",
            "USA": "USD",
            "US": "USD"
        };
    }

    async getCurrencyByCountry(countryName) {
        if (!countryName) {
            throw new Error("Le nom ou le code du pays est obligatoire.");
        }

        // Normalisation de la chaîne (Majuscules et retrait des espaces superflus)
        const normalizedInput = countryName.trim().toUpperCase();

        const currencyCode = this.countriesData[normalizedInput];

        if (!currencyCode) {
            throw new Error(`Le pays '${countryName}' n'est pas encore pris en charge ou est introuvable dans le système UniPay.`);
        }

        // On retourne immédiatement le code de la devise ISO
        return currencyCode;
    }
}

module.exports = new CountryService();