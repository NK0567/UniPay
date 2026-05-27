// src/database/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function simulerEcosysteme() {
    console.log("🚀 Début de la simulation UniPay...");

    // 1. Sécuriser ou créer MTN MOMO
    let mtn = await prisma.agregateur.findFirst({ where: { nom: "MTN MOMO" } });
    if (!mtn) {
        mtn = await prisma.agregateur.create({
            data: {
                nom: "MTN MOMO",
                type: "MOBILE_MONEY",
                pays: "CM",
                commissionPct: 0.025,
                statut: "ACTIF"
            }
        });
        console.log("✅ Agrégateur MTN MOMO créé dynamiquement.");
    }

    // 2. Sécuriser ou créer Orange Money
    let orange = await prisma.agregateur.findFirst({ where: { nom: "ORANGE MONEY" } });
    if (!orange) {
        orange = await prisma.agregateur.create({
            data: {
                nom: "ORANGE MONEY",
                type: "MOBILE_MONEY",
                pays: "CM",
                commissionPct: 0.03,
                statut: "ACTIF"
            }
        });
        console.log("✅ Agrégateur Orange Money créé dynamiquement.");
    }

    // 3. Trouver ou créer ton utilisateur ADMIN
    let adminUser = await prisma.utilisateur.findFirst({ where: { role: "ADMIN" } });
    if (!adminUser) {
        adminUser = await prisma.utilisateur.create({
            data: {
                nom: "Boris Admin",
                email: "admin@unipay.app",
                motDePasse: "$2b$10$eFmsjdfmshjdfmshjdfmse", 
                telephone: "+237600000000",
                role: "ADMIN",
                statut: "ACTIF"
            }
        });
        console.log("✅ Utilisateur ADMIN de secours créé (admin@unipay.app).");
    }

    // 4. Lui créer un Portefeuille si absent
    let portefeuilleAdmin = await prisma.portefeuille.findFirst({
        where: { utilisateurId: adminUser.id }
    });
    
    if (!portefeuilleAdmin) {
        portefeuilleAdmin = await prisma.portefeuille.create({
            data: {
                utilisateurId: adminUser.id,
                solde: 50000.0, 
                devise: "XAF"
            }
        });
        console.log("✅ Portefeuille physique Admin rattaché.");
    }

    // 🧠 Identification dynamique du nom de ton modèle dans schema.prisma (liensPaiement ou lienPaiement)
    const modeleLien = prisma.liensPaiement || prisma.lienPaiement;
    
    if (!modeleLien) {
        console.log("❌ Impossible de trouver le modèle des liens de paiement dans ton client Prisma.");
        return;
    }

    let lienTest = await modeleLien.findFirst({
        where: { id: "lien-test-123" }
    });

    if (!lienTest) {
        // Calcul d'une date d'expiration valide (J+30)
        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 30);

        lienTest = await modeleLien.create({
            data: {
                id: "lien-test-123",
                code: "UNIPAY-TEST-CODE",
                token: "UNIPAY-TEST-SECURE-TOKEN-12345",
                montant: 100.0,
                statut: "ACTIF",
                // titre: "Facture Test Internationale",
                dateExpiration: expiration, // 🧠 Remplacé par un vrai objet Date clean
                utilisateurId: adminUser.id,
                portefeuilleId: portefeuilleAdmin.id
            }
        });
        console.log("✅ Lien de paiement physique créé avec succès.");
    }

    // 5. Générer une fausse transaction MTN MOMO réussie liée au portefeuille
    await prisma.transaction.create({
        data: {
            type: "TRANSFERT",
            montant: 10000.0,
            deviseSource: "XAF",
            deviseCible: "XAF",
            tauxApplique: 1.0,
            montantConverti: 10000.0,
            statut: "SUCCES",
            frais: 200.0, 
            gainSpread: 0.0,
            description: "Simulation transaction réussie MoMo",
            paysOperation: "CM",
            agregateurId: mtn.id,
            walletSourceId: portefeuilleAdmin.id
        }
    });

    // 6. Générer une fausse transaction Internationale liée au portefeuille ET au lien de paiement valide
    await prisma.transaction.create({
        data: {
            type: "TRANSFERT",
            montant: 100.0, 
            deviseSource: "USD",
            deviseCible: "XAF",
            tauxApplique: 603.50, 
            montantConverti: 60350.0,
            statut: "SUCCES",
            frais: 500.0,
            gainSpread: 1500.0, 
            description: "Simulation paiement international par lien",
            paysOperation: "CM",
            agregateurId: orange.id,
            lienPaiementId: lienTest.id, 
            walletSourceId: portefeuilleAdmin.id
        }
    });

    console.log("🔥 Données financières injectées avec succès !");
}

simulerEcosysteme()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());