const transactionService = require('../services/transaction.service');

class TransactionController{
    // 
    async effectuerPaiementLien(req, res){
        try {
            // l'ID de expéditeur vient du token décodé par le middleware
            const expediteurId = req.user.id;
            const {codeLien, montant} = req.body;

            // Un excellent réflexe de dev : ajoute un console.log ici pour voir ce qui arrive réellement dans ton terminal quand tu cliques sur Send :
            console.log("Données reçues du body :", req.body);
            // on appelle le service pour exécuter le transfert
            const transaction = await transactionService.payerViaLien(
                expediteurId,
                codeLien,
                parseFloat(montant),
                req.body.deviseSource || "XAF"  //* capture la devise envoyée (ex: "USD")
            );
            return res.status(200).json({
                succes: true,
                message: 'paiement par lien traité avec succès',
                data: transaction
            });
        } catch (error) {
            return res.status(400).json({
                succes: false,
                message: error.message
            });
        }
    }
}


module.exports = new TransactionController()