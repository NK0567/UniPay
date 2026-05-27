// on récupère notre instance Prisma pour parler à la base de donnée 
const prisma = require('../../../database/prisma');

class WalletRepository{
    // cette fonction cherche le porte feuille unique lié a chaque utilisateur précis
    async findByUserId(userId){
        return await prisma.portefeuille.findUnique({
            where:{
            // on utilise l'ID que le middleware a extraire du token
                utilisateurId: userId
            }
        });
    }
}

module.exports = new WalletRepository()