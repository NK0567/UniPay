const walletService = require('../services/wallet.service');

class WalletController{
    // cette méthode repond à le requête de consultation de solde
    async getSolde(req, res){
        try {
            // 'req.user.id' a été injecter par le middleware d'authentification !
            const userId = req.user.id;

            const wallet = await walletService.getBalance(userId);

            return res.status(200).json({
                succes: true,
                message: 'Solde récuperer avec succes',
                data: {
                    solde: wallet.solde,
                    devise: wallet.devise || "XAF", // Valeur par defaut si non definie
                    statut: wallet.statut
                }
            });
        } catch (error) {
            return res.status(400).json({
                succes: false,
                message: error.message
            });
        }
    }
}

module.exports = new WalletController();