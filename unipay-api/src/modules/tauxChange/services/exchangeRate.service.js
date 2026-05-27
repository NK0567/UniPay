const axios = require('axios');
// const countrySercice = require('./country.sercice');

class ExchangeRateService{
    async fecthRates( baseCurrency = countrySercice.currencyCode){
        const url = `${process.env.EXCHANGE_RATE_BASE_URL}/${process.env.EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`;

        const response = axios.get(url);
        return response.data;
    }
}

module.exports = new ExchangeRateService();