const conversionService = require('../../transaction/services/conversion.service');
const transactionService = require('../../transaction/services/transaction.service');
// 🔗 Importation du service de lien de paiement existant
const lienPaiementService = require('../../lienPaiement/services/lien.service');

class ChatbotService {
    async traiterMessage(utilisateurId, message) {
        const texte = message.trim().toLowerCase();

        // ==========================================
        // 🔤 INTENTION 1 : LE GUIDE INTERACTIF (HELP)
        // ==========================================
        const motsClesAide = ['aide', 'help', 'tuto', 'comment', 'fonctionne'];
        if (motsClesAide.some(mot => texte.includes(mot))) {
            return `📖 *Guide UniPay Assistant*\n\n` +
                   `• _"Solde"_ : Pour voir votre solde.\n` +
                   `• _"100 USD en XAF"_ : Pour simuler un changement.\n` +
                   `• _"Lien 5000 USD"_ ou _"Lien 10000 XAF"_ : Création dynamique.\n` +
                   `• _"Paye 5000 sur [CODE]"_ : Effectuer un paiement.`;
        }

        // ==========================================
        // 💰 INTENTION 2 : CONSULTATION DE SOLDE (Dynamique via Service si tu veux, ou direct)
        // ==========================================
        if (texte.includes('solde') || texte.includes('argent')) {
            // Ici, si tu as un portefeuilleService, utilise-le ! Sinon on garde le strict minimum
            const portefeuille = await require('../../../database/prisma').portefeuille.findUnique({ where: { utilisateurId } });
            return `💼 *UniPay* : Votre solde actuel est de *${portefeuille.solde} XAF*.`;
        }

        // ==========================================
        // 💱 INTENTION 3 : SIMULATION DE CONVERSION DYNAMIQUE
        // ==========================================
        const regexConversion = /(\d+)\s*(usd|eur|cad|xaf)\s*(?:en|vers|to)?\s*(usd|eur|cad|xaf)?/;
        if (regexConversion.test(texte) && !texte.includes('lien')) {
            const match = texte.match(regexConversion);
            const montant = parseFloat(match[1]);
            const deviseSource = match[2].toUpperCase();
            const deviseCible = match[3] ? match[3].toUpperCase() : 'XAF'; // Par défaut XAF

            try {
                const calcul = conversionService.calculerConversion(deviseSource, deviseCible, montant);
                return `💱 *Simulation de Conversion Dynamique* :\n\n` +
                       `• Montant : *${montant} ${deviseSource}*\n` +
                       `• Taux appliqué : *${calcul.tauxApplique} ${deviseCible}*\n` +
                       `• Destinataire reçoit : *${calcul.montantConverti} ${deviseCible}*`;
            } catch (error) {
                return `❌ ${error.message}`;
            }
        }

        // ==========================================
        // 🚀 INTENTION 4 : CRÉATION DE LIEN DYNAMIQUE (VIA TON SERVICE)
        // ==========================================
        if (texte.includes('lien')) {
            const regexMontant = /(\d+)/;
            const regexDevise = /(usd|eur|cad|xaf)/;

            const montantMatch = texte.match(regexMontant);
            const deviseMatch = texte.match(regexDevise);

            if (montantMatch) {
                const montant = parseFloat(montantMatch[0]);
                // Détection dynamique de la devise demandée (ex: "Lien 50 USD"), sinon XAF par défaut
                const devise = deviseMatch ? deviseMatch[0].toUpperCase() : 'XAF'; 

                try {
                    // 🔥 EXCELLENT RÉFLEXE BORIS : On appelle ton vrai service métier !
                    // On lui passe juste les données brutes, il gère les tokens, portefeuilles et Prisma.
                    const nouveauLien = await lienPaiementService.genererNouveauLien(utilisateurId);

                    return `🔗 *Votre Lien de Paiement UniPay (${devise}) est prêt !*\n\n` +
                           `• Montant : *${montant} ${devise}*\n` +
                           `• Code unique : *${nouveauLien.code}*\n\n` +
                           `👉 URL à partager :\n*${nouveauLien.url}*`;

                } catch (error) {
                    return `❌ *Échec création lien via Service* : ${error.message}`;
                }
            }
            return `❓ Écrivez : _"Lien 5000 XAF"_ ou _"Lien 20 USD"_.`;
        }

        // ==========================================
        // ⚡ INTENTION 5 : PAIEMENT PAR LIEN DYNAMIQUE
        // ==========================================
        const regexCodeLien = /[A-Z0-9]{6}/i; 
        if (texte.includes('paye') || texte.includes('envoie') || regexCodeLien.test(message)) {
            const codeTrouve = message.match(regexCodeLien);
            const regexMontant = /(\d+)/;
            const montantTrouve = texte.match(regexMontant);
            const deviseMatch = texte.match(/(usd|eur|cad|xaf)/);

            if (codeTrouve && montantTrouve) {
                const codeLien = codeTrouve[0];
                const montant = parseFloat(montantTrouve[0]);
                const deviseSource = deviseMatch ? deviseMatch[0].toUpperCase() : 'XAF';

                try {
                    // Utilisation de ton TransactionService
                    const tx = await transactionService.payerViaLien(utilisateurId, codeLien, montant, deviseSource);
                    return `✅ *Paiement effectué !*\n\n• Montant débité : *${montant} ${deviseSource}*\n• Statut : *${tx.statut}*`;
                } catch (error) {
                    return `❌ *Échec du paiement* : ${error.message}`;
                }
            }
        }

        return `🤖 Écrivez *'Aide'* pour voir les commandes disponibles.`;
    }
}

module.exports = new ChatbotService();