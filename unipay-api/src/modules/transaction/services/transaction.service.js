/*
    👉 contient :
    * logique transfert
    * débit
    * crédit
    * vérification solde
*/

const transactionRepository = require('../repositories/transaction.repository');
const conversionService = require('./conversion.service'); //*Import du nouveau service
const prisma = require('../../../database/prisma'); // pour des vérifications rapides

class TransactionService{

    // on utilise le code unique du lien générer
    //* on ajoute deviseSource (par defaut "XAF" si non spécifié)
    async payerViaLien(expediteurId, codeLien, montant, deviseSource = "XAF"){
        // 1. validation du montant
        if(!montant || montant <= 0){
            throw new Error('Le montant du transfert doit être supérieur à 0 XAF.');
        }

        // 2. on cherche le lien de paiement dans la base de données
        const lien = await prisma.lienPaiement.findUnique({
            where: {
                code: codeLien,
                statut: "ACTIF"
            }
            // include: { utilisateur: true} //on inclut le créateur de lien, le recepteur
        });
        if(!lien){
            throw new Error('Lien de paiement invalide, expiré ou désactiver.')
        }
        
        //  3. on vérifie si le lien à une date d'expiration depassée
        if(lien.dateExpiration && new Date() > lien.dateExpiration){
            // Optional : Mettre le satut de lien en EXPIRE en arrière-plan
            await prisma.lienPaiement.update({
                where: {id: lien.id},
                data: {statut: "EXPIRE"}
            });
            throw new Error('Ce lien de paiement à expiré');
        }

        l
        const destinataireId = lien.utilisateurId;
        // 4. Sécuriter Anti-Fraude : On vérifie qu'on ne s'envoie pas l'argent à soi-même, impossible de payer son propre lien
        if(expediteurId === destinataireId){
            throw new Error('Opération impossible: Vous ne pouvez pas payer votre propre lien de paiement')
        }

        //* Ecoute la desise du portefeuille source (toujours XAF pou l'instant)
        const deviseCible = "XAF"

       // * logique de conversion automatique
        const resultat = conversionService.calculerConversion(
            deviseSource,
            deviseCible,
            montant
        );

        // ✅ Sécurité absolue : On extrait proprement depuis l'objet retourné
        // Même si conversion.service a un problème de "tauxAppliquer", on évite le crash direct de scope
        const tauxApplique = resultat.tauxApplique || resultat.tauxAppliquer || 1.0;
        const montantConverti = resultat.montantConverti;

        // À l'intérieur de la méthode de création de transaction de ton TransactionService :
        let fraisAppliques = fraisCalcules;

        // Si l'initiateur est l'admin, les frais sont instantanément écrasés à 0
        // const fraisAppliques = (req.user.role === 'ADMIN') ? 0 : fraisCalcules;
        // 💡 Si l'utilisateur initiateur est un administrateur, le système lui fait un cadeau : 0 FRAIS
        if (req.user.role === 'ADMIN') {
            fraisAppliques = 0;
        }

        //*on passe toutes ces informatons calculées au Repository
        // 5. lancer le transfert sécurisé dans le repository
        return await transactionRepository.executerTransfertViaLien(
            expediteurId,
            destinataireId,
            lien.id,
            montant,            // Le montant d'origine (ex: 100 USD)
            montantConverti,    // le montant converti final (ex: 61500 XAF)
            tauxApplique,       // le taux avec le Spread inclus
            deviseSource,
            deviseCible
        );
    }
}

module.exports = new TransactionService();