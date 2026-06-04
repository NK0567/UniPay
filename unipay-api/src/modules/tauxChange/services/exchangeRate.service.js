const axios = require('axios');
// 🔧 REFACTORING: Import corrigé (typo sercice → service)
// const countryService = require('./country.service');

class ExchangeRateService{
    async fecthRates( baseCurrency = countrySercice.currencyCode){
        const url = `${process.env.EXCHANGE_RATE_BASE_URL}/${process.env.EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`;

        const response = axios.get(url);
        return response.data;
    }
}

module.exports = new ExchangeRateService();