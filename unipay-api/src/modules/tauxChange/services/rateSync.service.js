// const tauxChangeRepository = require("../repositories/tauxChange.repository");
// const countrySercice = require("./country.sercice");
// const exchangeRateService = require("./exchangeRate.service");

class RateSyncService{
    async syncRate(baseCurrency = countrySercice.currencyCode){
        const data = await exchangeRateService.fecthRates(baseCurrency);

        const rates = data.conversion_rates;
        for(const currency in rates){
            await tauxChangeRepository.upsertRate(baseCurrency, currency, rates[currency]);
        }

        console.log('taux de change synchronisés');
    }
}

module.exports = new RateSyncService();