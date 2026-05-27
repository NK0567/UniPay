// npx prisma db seed

const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function main(){
    console.log('🚀 Initialisation du système UniPay...');
    
    // 1 injection de l'agregateur interne mondiale

    const agregateur = await prisma.agregateur.upsert({
        where: { id: 'ag_unipay'},
        update: {},
        create: {
            id: 'ag_unipay',
            nom: 'UniPay Modial',
            type: 'INTERNE',
            pays: 'ALL',
            commissionPct: 0.015,
            statut: 'ACTIF'
        }
    });
    console.log(`✅ Agrégateur configuré : ${agregateur.nom}`);

    // Création de l'Administrateur Système Unique
    const salt = await bcrypt.genSalt(12);

    const motDePasseAdminHashe = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    const admin = await prisma.utilisateur.upsert({
        where: {email: process.env.ADMIN_EMAIL},
        update: {},
        create: {
            nom: 'SYSTEM',
            prenom: 'ADMIN',
            email: process.env.ADMIN_EMAIL,
            telephone: '+237600000000', // Numéro technique admin
            motDePasse: motDePasseAdminHashe,
            pays: 'CM',
            role: 'ADMIN',
            statutCompte: 'ACTIF',
            statutKYC: 'VERIFIE' 
        }
    });

    // 3. Création du Portefeuille de la Trésorerie Admin (Collecte des frais)
    await prisma.portefeuille.upsert({
        where: { utilisateurId: admin.id },
        update: {},
        create: {
            utilisateurId: admin.id,
            solde: 0.0000,
            soldeBloque: 0.0000,
            statut: 'ACTIF'
        }
    });

    await prisma.portefeuille.upsert({
    where: {
        utilisateurId: "8d5ea33d-5da0-44c2-acd9-dc2035c98efa"
    },
    update: {},
    create: {
        utilisateurId: "8d5ea33d-5da0-44c2-acd9-dc2035c98efa",
        solde: 0,
        soldeBloque: 0,
        statut: "ACTIF",
        devise: "XAF" // 👈 On lui attribue explicitement sa vraie devise de base
    }
    });

    // Fais la même chose pour tes utilisateurs de test (Payeur et Receveur)
    // Exemple : un en XAF, l'autre en XAF (ou EUR si tu testes la conversion)

    // Initialisation des configurations dynamiques de la plateforme
    await prisma.configurationGenerale.upsert({
        where: { cle: "FRAIS_LIEN_PAIEMENT" },
        update: {},
        create: {
            cle: "FRAIS_LIEN_PAIEMENT",
            valeur: "0.015", // 1.5% par défaut, modifiable depuis l'admin
            description: "Taux de commission appliqué lors d'un encaissement par lien sécurisé"
        }
    });

    console.log("⚙️ Configuration dynamique initialisée avec succès !");

  console.log(`✅ Administrateur Système créé avec succès (Email: ${admin.email})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
