const express = require('express');
const router = express.Router();

// Importation des routes de chaque module
const authRoutes = require('../modules/auth/routes/auth.routes')//on importe les routes d'authentifications
const walletRoutes = require('../modules/portefeuille/routes/wallet.routes')
const transactionRoutes = require('../modules/transaction/routes/transaction.routes')
const lienRoutes = require('../modules/lienPaiement/routes/lien.routes')
const chatbotRoutes = require('../modules/chatbot/routes/chatbot.routes')
const whatsappRoutes = require('../modules/whatsapp/routes/whatsapp.routes');
const adminRoutes = require('../modules/admin/routes/admin.routes')
const epargneRoutes = require('../modules/epargne/routes/epargne.routes')
const carteRoutes = require('../modules/carteVirtuelle/routes/carte.routes')
const paiementRoutes = require('../modules/paiement/routes/paiement.routes')
const conversionRoutes = require('../modules/tauxChange/routes/tauxChange.routes');
const dashboardRoutes = require('../modules/dashboard/routes/dashboard.routes');
const securiteRoutes = require('../modules/sécurité/routes/securite.routes');
const notificationRoutes = require('../modules/notification/routes/notification.routes');
const utilisateurRoutes = require('../modules/utilisateur/routes/user.routes');
const configurationRoutes = require('../modules/configuration/routes/configuration.routes');
const agregateurRoutes = require('../modules/agrégateur/routes/agregateurs.routes');

// Route technique de Health Check (Vérification de l'état de l'API)
router.get('/health', (req, res) => {
  res.status(200).json({ status: "UP", timestamp: new Date() });
});

// 🔧 REFACTORING: Correction des app.use() → router.use() (BUG: app n'est pas défini)

// on monte le module Auth pour toutes les routes de auth.routes.js commencerons par /auth
router.use('/auth', authRoutes);

// on monte la route agregateur pour toutes les routes de agregateurs.routes.js commencerons par /admin/agregateurs
router.use('/agregateurs', agregateurRoutes);

// on monte le module wallet pour toutes les routes de wallet.routes.js commencerons par /wallet
router.use('/wallet', walletRoutes)

// Branchement de la route globale des TRANSACTIONS, ils commenceront par /transaction
router.use('/transaction', transactionRoutes)

//Branchement des routes de lien de PAIEMENT, ils commenceront par /lien-paiement
router.use('/lien-paiement', lienRoutes)

// Branchement de la route du CHABOT, il commence par /chatbot
router.use('/chatbot', chatbotRoutes)

// branchement de la route ADMIN, il commence par /admin
router.use('/admin', adminRoutes)

// branchement de la route WHATSAPP, il commence par /whatsapp
router.use('/whatsapp', whatsappRoutes);

// branchement de la route EPARGNE, il commence par /epargne
router.use('/epargne', epargneRoutes);

// Branchement de la route de gestion des CARTES VIRTUELLES, elle commence par /cartes
router.use('/cartes', carteRoutes);

// branchement de la route de paiement, il commence par /paiement
router.use('/paiement', paiementRoutes);

// branchement de la route de conversion, il commence par /conversion
router.use('/conversion', conversionRoutes);

// branchement de la route du DASHBOARD, il commence par /dashboard
router.use('/dashboard', dashboardRoutes);

// branchement de la route securite, il commence par /securite
router.use('/securite', securiteRoutes);

// branchement de la route notification, il commence par /notification
router.use('/notification', notificationRoutes);

// branchement de la route configuration, il commence par /configuration
router.use('/configuration', configurationRoutes);

// branchement de la route utilisateur, il commence par /utilisateurs
router.use('/utilisateurs', utilisateurRoutes);


module.exports = router;