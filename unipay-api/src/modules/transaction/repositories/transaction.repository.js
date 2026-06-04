// Ce fichier effectue trois actions en une seule fois dans la base de données : vérifier/débiter l'expéditeur, créditer le destinataire, et enregistrer l'historique
const prisma = require('../../../database/prisma');

// 🔧 REFACTORING: Correction de la typo dans le nom de classe (TransactioRepository → TransactionRepository)
class TransactionRepository{
    //Cette fonction éxecute le transfert de portefeuille à portefeuille de manière sécuriser et atomique
    async executerTransfertViaLien(expediteurId, destinataireId, lienId, montant, montantConverti, tauxApplique, deviseSource, deviseCible){
        // on utilise prisma.$transaction pour regrouper toutes les requêtes
        return await prisma.$transaction(async (tx)=>{
            //* on débite le portefeuille de l'expéditeur (on suppose qu'il paie le montant d'origine)
            //* Note: si l'expediteur paye en USD, et a un portefeuille USD on decremente 'montant'
            //*Si l'écosystème est purement XAF pour le moment sous le capot, on adapte pour les besoins 
            // 1. on débite le portefeuille de l'expéditeur
            const portefeuilleExp = await tx.portefeuille.update({
                where: {utilisateurId : expediteurId},
                data: {
                    // on retire le montant du  solde exisistant
                    solde: {decrement: montant}
                }
            });
            // double sécurité: on verifie que le solde ne soit pas négatif, on bloque dans cas
            if(parseFloat(portefeuilleExp.solde) < 0){
                throw new Error('Solde insufisant pour effectuer ce tansfert.');
            }

            // 2. On crédite le portefeuille du destinataire  
            await tx.portefeuille.update({
                where: {utilisateurId: destinataireId},
                data: {
                    // on ajoute le montant au solde existant
                    solde: {increment: montant}
                }
            });

            // 3. Enregistrer la transaction dans l'historique pour l'audit
            const historiqueTransaction = await tx.transaction.create({
                data: {
                    montant: montant,
                    montantConverti: montantConverti,   //* montant reçu après conversion (ex: 61500)
                    tauxApplique: tauxApplique,     //* taux appliqué (ex: 615)
                    type: "TRANSFERT", // type d'operation (Enum)
                    statut: "SUCCES", // statut de la transaction
                    // onfournit les champs exigé par le schéma prisma
                    deviseSource: deviseSource, // La devise d'origine: exigée par le modèle
                    deviseCible: deviseCible, // Si dans le schema il ya aussi un champ devisDestinataire, on l'ajoute par sécurité
                    // expediteurId: expediteurId,
                    // destinataireId: destinataireId,
                    // lienPaiementId: lienId,  //on associe la transaction au lien de paiement 
                    referenceMarchand: `TX-LINK-${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Référence unique
                    // on connecte la relation walletSourcevia l'utilisateurId de l'expediteur
                    // 🔥 CALCUL DES FRAIS CONFIGURABLES (0.05% selon tes spécifications)
                    // 5000 XAF * 0.0005 = 2.5 XAF de frais
                    frais: parseFloat((montantConverti * 0.0005).toFixed(4)), 

                    // ✅ RELATIONS UTILISATEURS (via connect)
                    expediteur: {
                        connect: { id: expediteurId }
                    },
                    destinataire: {
                        connect: { id: destinataireId }
                    },
                    
                    // ✅ RELATIONS PORTEFEUILLES
                    walletSource: {
                        connect: { utilisateurId: expediteurId }
                    },
                    walletDest: { // Tiré directement de ton log d'erreur Prisma !
                        connect: { utilisateurId: destinataireId }
                    },

                    // ✅ RELATION AGRÉGATEUR
                    agregateur: {
                        connect: { id: "UNIPAY_INTERNAL" } 
                    },

                    // ✅ RELATION LIEN DE PAIEMENT
                    lienPaiement: {
                        connect: { id: lienId }
                    }
                }
            });

            // on retourne le détaille de l'historique créé
            return historiqueTransaction;
        });
    }
}


module.exports = new TransactionRepository()