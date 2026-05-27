const cron = require('node-cron');
const rateSyncService = require('../modules/tauxChange/services/rateSync.service');
const countrySercice = require('../modules/tauxChange/services/country.sercice');

cron.schedule('0 * * * *', async ()=>{
    console.log('Mise à jour des taux de change');
    await rateSyncService.syncRate(countrySercice.currencyCode);
})