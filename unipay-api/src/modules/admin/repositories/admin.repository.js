const prisma = require("../../../database/prisma");

class AdminRepository {
    // Récupère toutes les transactions d'un coup pour calculer les statistiques
    async trouveTransactionSucces(){
        return await prisma.transaction.findMany({
            where: { statut: "SUCCES" },
            include: { 
                agregateur: true,
                walletSource: true
            }
        });
    }

    // Gestion des clés de configurations globales
    async obtenirConfigurationParCle(cle){
        return await prisma.configurationSysteme.findUnique({
            where: { cle }
        });
    }

    async sauvegarderConfig(cle, valeur, type, description){
        return await prisma.configurationSysteme.upsert({
            where: { cle },
            update: { valeur: valeur.toString() },
            create: { cle, valeur: valeur.toString(), type, description }
        });
    } 

    // Gestion dynamique des agrégateurs
    async creerAgregateur(data){
        return await prisma.agregateur.create({
            data:{
                nom: data.nom.toUpperCase(),
                type: data.type, // MOBILE_MONEY, BANQUE, CARTE
                pays: data.pays.toUpperCase(),
                commissionPct: parseFloat(data.commissionPct || 0),
                statut: data.statut || "ACTIF"
            }
        });
    }

    async mettreAJourStatutAgregateur(id, statut){
        return await prisma.agregateur.update({
            where: { id },
            data: { statut }
        });
    }

    // Lister tous les agrégateurs enregistrés dans la bd
    async listerTousLesAgregateurs(){
        return await prisma.agregateur.findMany({
            include: { configurations: true }
        });
    }

    // Trouver le portefeuille de l'administrateur
    async obtenirPortefeuilleAdmin(){
        return await prisma.portefeuille.findFirst({
            where: {
                utilisateur: { role: "ADMIN" }
            }
        });
    }

    // Opération atomique (transaction prisma) : Créditer l'admin et consigner l'historique
    async executerVirementGains(portefeuilleId, montantGains, descriptionLog) {
        return await prisma.$transaction(async (tx) => {
            
            // 1. 💡 AJOUT DE 'await' : Créditer le portefeuille de l'admin
            const portefeuille = await tx.portefeuille.update({
                where: { id: portefeuilleId },
                data: { solde: { increment: montantGains } }
            });

            // 2. Recherche de l'agrégateur interne
            const internalAgreg = await tx.agregateur.findFirst({ where: { nom: "INTERNE" } });
            
            // Sécurité : Si pas d'agrégateur "INTERNE" en BD, on lève une erreur explicite
            if (!internalAgreg) {
                throw new Error("L'agrégateur avec le nom 'INTERNE' est requis en base de données pour la clôture.");
            }

            // 3. 💡 CORRECTION DES RELATIONS ET DES FAUTES DE FRAPPE : Créer la ligne d'historique
            const historiqueTx = await tx.transaction.create({
                data: {
                    type: "DEPOT",
                    montant: montantGains,
                    deviseSource: "XAF",
                    deviseCible: "XAF",
                    tauxApplique: 1.0,
                    montantConverti: montantGains, // ✅ Corrigé : "montantCoverti" -> "montantConverti"
                    statut: "SUCCES",                // ✅ Corrigé : "status" -> "statut"
                    frais: 0,
                    gainSpread: 0,                   // ✅ Corrigé : "gainSread" -> "gainSpread"
                    description: descriptionLog,
                    paysOperation: "CM",
                    
                    // ✅ Connexion relationnelle pour le Wallet Source (Portefeuille Admin)
                    walletSource: {
                        connect: { id: portefeuilleId }
                    },
                    
                    // ✅ Connexion relationnelle requise par Prisma pour l'Agregateur
                    agregateur: {
                        connect: { id: internalAgreg.id }
                    }
                }
            });

            return { portefeuille, historiqueTx };
        });
    }
}

module.exports = new AdminRepository();