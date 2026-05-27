const chatbotService = require("../services/chotbot.service");

class ChatbotController{
    async webhook(req, res){
        try {
            const utilisateurId = req.user.id;  //Identifié via le token JWT en production (ou ID lié au numero whatsapp en production)
            const { message } = req.body;

            if(!message){
                return res.status(400).json({
                    succes: false,
                    message: "Le message est vide."
                });
            }
            
            const reponseBot = await chatbotService.traiterMessage(utilisateurId, message)

            return res.status(200).json({
                succes: true,
                message: reponseBot
            });
        } catch (error) {
            return res.status(500).json({
                succes: false,
                message: error.message
            });
        }
    }
}

module.exports = new ChatbotController()