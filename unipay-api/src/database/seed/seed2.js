const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Début de l'injection massive pour le stress-test UniPay...");

    // 1. Récupération sécurisée des portefeuilles pour éviter les conflits d'Enums
    const tousLesPortefeuilles = await prisma.portefeuille.findMany({
        take: 2,
        include: { utilisateur: true }
    });

    if (tousLesPortefeuilles.length < 2) {
        console.error("❌ Erreur : Il te faut au moins 2 portefeuilles en base de données pour simuler des flux.");
        return;
    }

    const adminWallet = tousLesPortefeuilles[0];
    const clientWallet = tousLesPortefeuilles[1];

    // 2. Récupération des agrégateurs physiques ET de l'agrégateur INTERNE obligatoire
    const mtn = await prisma.agregateur.findFirst({ where: { nom: "MTN MOMO" } });
    const orange = await prisma.agregateur.findFirst({ where: { nom: "ORANGE MONEY" } });
    const paystack = await prisma.agregateur.findFirst({ where: { nom: "PAYSTACK" } });
    const interne = await prisma.agregateur.findFirst({ where: { nom: "INTERNE" } });

    if (!mtn || !orange || !paystack || !interne) {
        console.error("❌ Erreur : Assure-toi que les agrégateurs (MTN MOMO, ORANGE MONEY, PAYSTACK, INTERNE) existent en BD.");
        return;
    }

    const devises = ["USD", "EUR", "CAD", "XAF"];
    const pays = ["CM", "GA", "CI", "SN"];
    const types = ["DEPOT", "RETRAIT", "TRANSFERT"];
    
    // 3. Nettoyage des anciennes transactions de test
    await prisma.transaction.deleteMany({ where: { description: { contains: "STRESS_TEST" } } });
    await prisma.lienPaiement.deleteMany({ where: { id: "unipay-stress-test-link-uuid" } });

    console.log("🔗 Création d'un lien de paiement valide pour le respect des contraintes MySQL...");
    const lienTest = await prisma.lienPaiement.create({
        data: {
            id: "unipay-stress-test-link-uuid",
            code: "STRESS-TEST-CODE-99X",
            token: "stress-test-secure-token-xyz",
            montant: 5000,
            statut: "ACTIF",
            utilisateur: {
                connect: { id: clientWallet.utilisateurId }
            },
            portefeuille: {
                connect: { id: clientWallet.id }
            }
        }
    });

    console.log("⏳ Génération de 200 transactions complexes...");

    for (let i = 0; i < 200; i++) {
        const riddle = Math.random();
        const deviseSource = devises[Math.floor(Math.random() * devises.length)];
        const paysOperation = pays[Math.floor(Math.random() * pays.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const montantInitial = Math.floor(Math.random() * 495) + 5; 
        
        let tauxApplique = 1.0;
        let gainSpread = 0;
        let montantConverti = montantInitial;
        let frais = Math.floor(montantInitial * 0.02); 

        // Simulation du Spread FinTech si devise internationale
        if (deviseSource !== "XAF") {
            const tauxMarche = deviseSource === "USD" ? 610 : deviseSource === "EUR" ? 655 : 445;
            tauxApplique = tauxMarche - (Math.floor(Math.random() * 15) + 5); 
            montantConverti = montantInitial * tauxApplique;
            gainSpread = (montantInitial * tauxMarche) - montantConverti;
            frais = Math.floor(montantConverti * 0.01); 
        }

        // ✅ CORRECTION : Attribution d'un agrégateur (si pas de physique, on prend l'ID de "interne")
        let targetAgregateurId = interne.id;
        if (riddle < 0.25) targetAgregateurId = mtn.id;
        else if (riddle < 0.50) targetAgregateurId = orange.id;
        else if (riddle < 0.75) targetAgregateurId = paystack.id;

        // Associer le lien de paiement uniquement si on est sur un flux interne (riddle >= 0.75)
        const lienPaiementId = (targetAgregateurId === interne.id && Math.random() > 0.3) ? lienTest.id : null;

        await prisma.transaction.create({
            data: {
                type: type,
                montant: montantInitial,
                deviseSource: devises[Math.floor(Math.random() * devises.length)], 
                deviseCible: "XAF",
                tauxApplique: tauxApplique,
                montantConverti: montantConverti,
                statut: "SUCCES",
                frais: frais,
                gainSpread: gainSpread,
                description: `STRESS_TEST - Transaction simulée n°${i}`,
                paysOperation: paysOperation,
                
                walletSource: {
                    connect: { id: clientWallet.id }
                },
                // ✅ Toujours fourni car la relation est obligatoire
                agregateur: {
                    connect: { id: targetAgregateurId }
                },
                ...(lienPaiementId && {
                    lienPaiement: {
                        connect: { id: lienPaiementId }
                    }
                })
            }
        });
    }

    console.log("✅ Injection réussie de 200 transactions de test !");
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());