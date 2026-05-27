// Ce service va simuler ou aller chercher le taux brut du marché, lui ajouter ton Spread configuré (marge bénéficiaire), et calculer le résultat final.

class ConversionService{
    constructor(){
        // Taux réels du marché simulés (En production, on pourra requêter une API comme ExengeRat-API)
        this.tauxMarche = {
            "USD_XAF": 610.00,
            "EUR_XAF": 655.95,
            "CAD_XAF": 445.00
        } ;

        // Le spread configuré (ex: l'admin ajoute 5 FCFA de marge par Dollar/Euro)
        this.spread = {
            "USD_XAF": 5.00,
            "EUR_XAF": 4.05,
            "CAD_XAF": 3.00
        };
    }

    /**
     * Calcul le taux appliqué et le montant final converti
     * @param {string} deviseSource - Ex: "USD"
     * @param {string} deviseCible - Ex: "XAF"
     * @param {string} montantSource - Le montant envoyé dans la devise d'origine
     */

    calculerConversion(deviseSource, deviseCible, montantSource){
        // Si les devises sont identique (ex: XAF vers XAF) pas de conversion
        if(deviseSource === deviseCible){
            return {
                tauxApplique: 1.0,
                montantConverti: montantSource,
                gainSpread: 0.0
            };
        }

        const cleTaux = `${deviseSource}_${deviseCible}`;
        const tauxBrut = this.tauxMarche[cleTaux];
        const marge = this.spread[cleTaux];

        const rate = tauxChangeRepository.getRate(deviseSource, deviseCible);

        if(!rate){
            throw new Error(`La conversion ${deviseSource} vers ${deviseCible} n'est pas encore supportée`);
            //plus tard quand se genre de message viendra l'admin recevra une notification pour l'integration de cette devise
        }

        // APPLICATION DU SPREAD: On applique le taux avatageux pour la plateforme
        // Si on achète du USD pour donner au XA, UniPay donne 615 au lieu de 610 pour couvrir ses taux et marger
        const tauxApplique = tauxBrut + marge;

        const montantConverti = montantSource * rate.taux;

        // Calcul du gain géneré pour l'admin d'UniPay sur cette opération
        const gainSpread = montantSource * marge;

        return {
            tauxApplique: parseFloat(tauxApplique),
            montantConverti: parseFloat(montantConverti.toFixed(4)), // on respecte le Decimal(18,4) de ton schéma
            gainSpread: parseFloat(gainSpread.toFixed(4))
        };
    }

}


module.exports = new ConversionService();