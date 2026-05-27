// on importe les modules nécessaires pour créer l'application Express
const express = require('express') // framework pour notre serveur 
const cors = require('cors')  // pour autoriser les futurs frontent (REACT/FLUTTER) à parler avec notre api 

const authRoutes = require('./modules/auth/routes/auth.routes')//on importe les routes d'authentifications
const walletRoutes = require('./modules/portefeuille/routes/wallet.routes')
const transactionRoutes = require('./modules/transaction/routes/transaction.routes')
const lienRoutes = require('./modules/lienPaiement/routes/lien.routes')
const chatbotRoutes = require('./modules/chatbot/routes/chatbot.routes')
const adminRoutes = require('./modules/admin/routes/admin.routes')

const errorMiddleware = require('./middlewares/error.middleware') // middleware pour gérer les erreurs
const helmet = require('helmet') // helmet est un middleware de sécurité pour Express qui aide à protéger votre application contre certaines vulnérabilités web en définissant divers en-têtes HTTP.
const morgan = require('morgan')  // morgan est un middleware de journalisation pour Express qui enregistre les requêtes HTTP entrantes et les réponses sortantes, ce qui facilite le suivi et le débogage de votre application.

require('dotenv').config() // on utilise dotenv pour charger les variables d'environnement à partir d'un fichier .env, ce qui permet de gérer facilement les configurations sensibles telles que les clés API, les mots de passe, etc., sans les exposer dans le code source.
require('./jobs/exchange.job') // on importe le job de synchronisation des taux de change pour qu'il s'exécute automatiquement selon la planification définie (toutes les heures dans ce cas).

const app = express()

// --- MIDDLEWARES DE BASE ---

app.use(cors()) //Activer le CORS (sécurité pour les requêtes de domaines différents)
app.use(helmet())
app.use(morgan('dev'))

// permet express de lire le format JSON envoyé par le client posstman/Mobile/react
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// --- ROUTES ---

// on monte le module Auth pour toutes les routes de auth.routes.js commencerons par /api/auth
app.use('/api/auth', authRoutes);

// on monte le module wallet pour toutes les routes de wallet.routes.js commencerons par /api/wallet
app.use('/api/wallet', walletRoutes)

// Branchement de la route globale des TRANSACTIONS, ils commenceront par /api/transaction
app.use('/api/transaction', transactionRoutes)

//Branchement des routes de lien de PAIEMENT, ils commenceront par /api/lien-paiement
app.use('/api/lien-paiement', lienRoutes)

// Branchement de la route du CHABOT, il commence par /api/chatbot
app.use('/api/chatbot', chatbotRoutes)

// branchement de la route ADMIN, il commence par /api/admin
app.use('/api/admin', adminRoutes)


// route de test pour verifer que le serveur fonctionne correctement
app.get('/', (req, res)=>{
    res.json({message: "Bienvenue sur l'API UniPay ! 🚀"});
})


// --- GESTION DES ERREURS ---

// on place toujours le Middleware de gestion des erreurs à la fin pour capturer toutes les erreurs du système
app.use(errorMiddleware)

module.exports = app