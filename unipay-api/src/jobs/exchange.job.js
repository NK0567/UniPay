const cron = require('node-cron');
const rateSyncService = require('../modules/tauxChange/services/rateSync.service');
// 🔧 REFACTORING: Import correctement corrigé
const countryService = require('../modules/tauxChange/services/country.service');

cron.schedule('0 * * * *', async () => {
    console.log('Mise à jour des taux de change');
    try {
        // 🛠️ CORRECTION : Utilisation de countryService au lieu de countrySercice
        await rateSyncService.syncRate(countryService.currencyCode);
    } catch (error) {
        console.error('[NODE-CRON] [ERROR] Échec de la synchronisation des taux :', error.message);
    }
});