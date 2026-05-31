const epargneRepository = require('../modules/epargne/repositories/epargne.repository');

async function executerPrelevementsIntelligents() {

    const epargnes = await epargneRepository.listerEpargnesIntelligentesAAlimenter();

    for (const objectif of epargnes) {

        const wallet = objectif.portefeuille;
        const montant = Number(objectif.montantPrelevementAuto);

        // Vérification sécurité
        if (wallet.soldeDisponible < montant) {
            continue;
        }

        // Déduction wallet principal
        await prisma.portefeuille.update({
            where: { id: wallet.id },
            data: {
                soldeDisponible: {
                    decrement: montant
                }
            }
        });

        // Alimentation objectif
        await prisma.objectifEpargne.update({
            where: { id: objectif.id },
            data: {
                montantActuel: {
                    increment: montant
                }
            }
        });
    }
}

module.exports = {
    executerPrelevementsIntelligents
};