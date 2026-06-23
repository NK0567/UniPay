// npx prisma db seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const currencyHelper = require('../helpers/currency.helper');
const PasswordUtil = require('../utils/password.util');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Initialisation du système UniPay...');

    // 1. 🌟 CORRECTION CRITIQUE : Injection de l'agrégateur INTERNE requis par admin.repository.js
    const agregateurInterne = await prisma.agregateur.upsert({
        where: { id: 'ag_unipay' },
        update: {
            nom: 'INTERNE', // Force le nom attendu par executerVirementGains
            type: 'INTERNE',
            pays: 'ALL',
            statut: 'ACTIF'
        },
        create: {
            id: 'ag_unipay',
            nom: 'INTERNE',
            type: 'INTERNE',
            pays: 'ALL',
            commissionPct: 0.015,
            statut: 'ACTIF'
        }
    });
    console.log(`✅ Agrégateur système configuré : ${agregateurInterne.nom}`);

    // Configuration générale des commissions clients perçues par UniPay
    await prisma.configurationSysteme.upsert({
        where: { cle: "FRAIS_DEPOT_STANDARD" },
        update: {},
        create: {
            cle: "FRAIS_DEPOT_STANDARD",
            valeur: "0.02", // 2% de frais appliqués au client
            type: "FINANCIER",
            description: "Frais de dépôt par défaut facturés au client final"
        }
    });

    // Agrégateur Option A (Plus cher)
    await prisma.agregateur.upsert({
        where: { id: "test-agregateur-alpha" },
        update: {},
        create: {
            id: "test-agregateur-alpha",
            nom: "ORANGE_MONEY",
            type: "MOBILE_MONEY",
            pays: "CM",
            commissionPct: 0.0150, // 1.5% de frais réels
            fraisFixes: 0,
            statut: "TEST" // Mode Sandbox activé
        }
    });

    // Agrégateur Option B (Moins cher -> Le Smart Routing le choisira automatiquement !)
    await prisma.agregateur.upsert({
        where: { id: "test-agregateur-beta" },
        update: {},
        create: {
            id: "test-agregateur-beta",
            nom: "MTN_MOMO",
            type: "MOBILE_MONEY",
            pays: "CM",
            commissionPct: 0.0070, // 0.7% de frais réels (Marge UniPay maximale !)
            fraisFixes: 0,
            statut: "TEST"
        }
    });

    // 2. Création de l'Administrateur Système Unique
    const emailAdmin = process.env.ADMIN_EMAIL || 'admin@unipay.com';
    const passwordAdminClair = process.env.ADMIN_PASSWORD || 'AdminUniPay2026!';
    const telephoneAdmin = '+237600000000';

    // Vérifier si l'admin existe déjà avant toute opération
    const adminExiste = await prisma.utilisateur.findUnique({
        where: { email: emailAdmin }
    });

    if (!adminExiste) {
        const salt = await bcrypt.genSalt(12);
        const localisationAdmin = currencyHelper.detecterParTelephone(telephoneAdmin);

        const motDePasseAdminHashe = PasswordUtil.hacher
            ? await PasswordUtil.hacher(passwordAdminClair)
            : await bcrypt.hash(passwordAdminClair, salt);

        const soldeAdminAleatoire = Math.floor(Math.random() * (1000000 - 900000 + 1)) + 900000;

        const admin = await prisma.utilisateur.create({
            data: {
                nom: 'SYSTEM',
                prenom: 'ADMIN',
                email: emailAdmin,
                telephone: telephoneAdmin,
                motDePasse: motDePasseAdminHashe,
                pays: localisationAdmin.pays,
                role: 'ADMIN',
                statutCompte: 'ACTIF',
                statutKYC: 'VERIFIE',
                portefeuille: {
                    create: {
                        devise: localisationAdmin.devise,
                        solde: soldeAdminAleatoire,
                        soldeBloque: 0.0000,
                        statut: 'ACTIF'
                    }
                }
            }
        });
        console.log(`✅ Administrateur Système créé avec succès (Email: ${admin.email})`);
        console.log(`🌍 Pays Admin : ${localisationAdmin.pays} | 💱 Devise Admin : ${localisationAdmin.devise}`);
    } else {
        console.log(`ℹ️ L'Administrateur Système (${emailAdmin}) existe déjà. Création ignorée.`);
    }

    console.log('\n--------------------------------------------------------------------------------------------');
    console.log('🚀 Initialisation des utilisateurs de test UniPay...\n');

    const numerosInternationaux = [
        '+237650000001', // Cameroun
        '+33123456789',  // France
        '+12025550125',  // USA
        '+447911123456', // Royaume-Uni
        '+2348012345678',// Nigeria
        '+2250707070707',// Côte d’Ivoire
        '+221771234567', // Sénégal
        '+4915123456789',// Allemagne
        '+212612345678', // Maroc
        '+919876543210'  // Inde
    ];

    const passwordUserClair = 'Password123@!';

    for (let i = 1; i <= 2; i++) {
        const emailUser = `user${i}@unipay.com`;

        // Vérifier si l'utilisateur de test existe déjà
        const utilisateurExiste = await prisma.utilisateur.findUnique({
            where: { email: emailUser },
            include: { portefeuille: true }
        });

        if (!utilisateurExiste) {
            const numeroAleatoire = numerosInternationaux[Math.floor(Math.random() * numerosInternationaux.length)];
            const localisationUser = currencyHelper.detecterParTelephone(numeroAleatoire);
            const soldeUserAleatoire = Math.floor(Math.random() * (500000 - 300000 + 1)) + 300000;

            const motDePasseHashe = PasswordUtil.hacher
                ? await PasswordUtil.hacher(passwordUserClair)
                : await bcrypt.hash(passwordUserClair, 12);

            const utilisateur = await prisma.utilisateur.create({
                data: {
                    nom: `USER_${i}`,
                    prenom: `TEST_${i}`,
                    email: emailUser,
                    telephone: numeroAleatoire,
                    motDePasse: motDePasseHashe,
                    pays: localisationUser.pays,
                    role: 'USER',
                    statutCompte: 'ACTIF',
                    statutKYC: 'VERIFIE',
                    portefeuille: {
                        create: {
                            devise: localisationUser.devise,
                            solde: soldeUserAleatoire,
                            soldeBloque: 0.0000,
                            statut: 'ACTIF'
                        }
                    }
                }
            });

            console.log(`✅ Utilisateur ${i} créé`);
            console.log(`   👤 Nom : ${utilisateur.nom}`);
            console.log(`   📞 Téléphone : ${utilisateur.telephone}`);
            console.log(`   🌍 Pays : ${utilisateur.pays} | 💱 Devise : ${localisationUser.devise}`);
        } else {
            console.log(`ℹ️ L'Utilisateur ${i} (${emailUser}) existe déjà. Création ignorée.`);
        }
        console.log('--------------------------------------------\n');
    }

    console.log('🎉 Seed UniPay terminé avec succès.');

    // ==========================================
    // CONFIGURATIONS DES FRAIS ET COMMISSIONS UNIPAY
    // ==========================================
    const configsFinancieres = [
        { 
            cle: "FRAIS_DEPOT_PCT", 
            valeur: "2.0", 
            type: "FINANCIER", 
            description: "Frais de dépôt par défaut facturés au client (%)" 
        },
        { 
            cle: "FRAIS_RETRAIT_PCT", 
            valeur: "1.5", 
            type: "FINANCIER", 
            description: "Frais de retrait par défaut facturés au client (%)" 
        },
        { 
            cle: "FRAIS_PAIEMENT_LIEN_PCT", 
            valeur: "0.0", 
            type: "FINANCIER", 
            description: "Frais de transfert interne UniPay par lien (%)" 
        },
        {
            cle: "FRAIS_BLAME_EPARGNE_PCT", 
            valeur: "5.0", // Correction de la chaîne mal formée "0.5.0"
            type: "FINANCIER",
            description: "Pénalité en pourcentage prélevée en cas de rupture d'épargne stricte (%)"
        },
        { 
            cle: "FRAIS_ABONNEMENT_CARTE_FIXE", 
            valeur: "2000", 
            type: "FINANCIER", 
            description: "Frais d'abonnement / création de carte virtuelle (Montant)" 
        },
        { 
            cle: "FRAIS_PAIEMENT_CARTE_VIRTUELLE_PCT", 
            valeur: "1.0", 
            type: "FINANCIER", 
            description: "Commission sur paiement en ligne par carte virtuelle (%)" 
        },
        { 
            cle: "FRAIS_CONVERSION_SPREAD_PCT", 
            valeur: "0.5", 
            type: "FINANCIER", 
            description: "Marge (Spread) UniPay appliquée sur le taux de change (%)" 
        }
    ];

    for (const config of configsFinancieres) {
        await prisma.configurationSysteme.upsert({
            where: { cle: config.cle },
            update: {}, // Ne pas écraser si l'admin a déjà modifié les valeurs
            create: config
        });
    }
    console.log("📊 Toutes les commissions dynamiques ont été injectées.");

    console.log('⚡ Injection de la matrice des 11 agrégateurs internationaux...');

    const matriceAgregateurs = [
        // --- 🇨🇲 CAMEROUN (Zone XAF) ---
        { id: "flw-cm-momo", nom: "MTN_MOMO_FLUTTERWAVE", type: "MOBILE_MONEY", pays: "CM", operationType: "LES_DEUX", commissionPct: 0.0150, fraisFixes: 0 },
        { id: "bizao-cm-momo", nom: "MTN_MOMO_BIZAO", type: "MOBILE_MONEY", pays: "CM", operationType: "LES_DEUX", commissionPct: 0.0110, fraisFixes: 10 },
        { id: "cinetpay-cm-orange", nom: "ORANGE_MONEY_CINETPAY", type: "MOBILE_MONEY", pays: "CM", operationType: "LES_DEUX", commissionPct: 0.0200, fraisFixes: 0 },
        { id: "monetbill-cm-orange", nom: "ORANGE_MONEY_MONETBILL", type: "MOBILE_MONEY", pays: "CM", operationType: "LES_DEUX", commissionPct: 0.0130, fraisFixes: 0 },

        // --- 🇨🇮 CÔTE D'IVOIRE & 🇸🇳 SÉNÉGAL (Zone XOF) ---
        { id: "touchpay-sn-wave", nom: "WAVE_TOUCHPAY", type: "MOBILE_MONEY", pays: "SN", operationType: "LES_DEUX", commissionPct: 0.0060, fraisFixes: 0 },
        { id: "intouch-ci-orange", nom: "ORANGE_CI_INTOUCH", type: "MOBILE_MONEY", pays: "CI", operationType: "LES_DEUX", commissionPct: 0.0180, fraisFixes: 0 },
        { id: "paystack-ci-momo", nom: "MTN_CI_PAYSTACK", type: "MOBILE_MONEY", pays: "CI", operationType: "LES_DEUX", commissionPct: 0.0140, fraisFixes: 0 },
        { id: "serdipay-tg-moov", nom: "MOOV_BENIN_SERDIPAY", type: "MOBILE_MONEY", pays: "BJ", operationType: "LES_DEUX", commissionPct: 0.0125, fraisFixes: 25 },

        // --- 🇪🇺 FRANCE / 🇺🇸 USA (Zone EUR/USD) ---
        { id: "stripe-eu-card", nom: "STRIPE_EUROPE", type: "CARTE", pays: "FR", operationType: "LES_DEUX", commissionPct: 0.0140, fraisFixes: 150 },
        { id: "paymoney-us-wallet", nom: "PAYMONEY_USA", type: "CARTE", pays: "US", operationType: "LES_DEUX", commissionPct: 0.0290, fraisFixes: 200 }
    ];

    for (const ag of matriceAgregateurs) {
        await prisma.agregateur.upsert({
            where: { id: ag.id },
            update: {
                commissionPct: ag.commissionPct,
                fraisFixes: ag.fraisFixes,
                operationType: ag.operationType
            },
            create: ag
        });
    }
    console.log('✅ Matrice d\'agrégateurs déployée.');
}

main()
    .catch((e) => {
        console.error("❌ Erreur lors de l'exécution du seed :", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });