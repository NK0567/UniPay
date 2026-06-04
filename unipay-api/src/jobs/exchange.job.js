const cron = require('node-cron');
const rateSyncService = require('../modules/tauxChange/services/rateSync.service');
// 🔧 REFACTORING: Correction de l'import après renommage du fichier (country.sercice → country.service)
const countryService = require('../modules/tauxChange/services/country.service');

cron.schedule('0 * * * *', async ()=>{
    console.log('Mise à jour des taux de change');
    await rateSyncService.syncRate(countrySercice.currencyCode);
})