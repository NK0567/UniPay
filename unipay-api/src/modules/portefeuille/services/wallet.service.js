const walletRepository = require('../repositories/wallet.repository');

class WalletService{
    // Logique pour récupérer les informations financières de l'utilisateur
    async getBalance(userID){
        const wallet = await walletRepository.findByUserId(userID);

        if(!wallet){
            throw new Error('Portefeuille introuvable pour cet utilisateur');
        }
        return wallet;
    } 
}


module.exports = new WalletService();