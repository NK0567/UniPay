// on importe les modules nécessaires pour créer l'application Express
const express = require('express') // framework pour notre serveur 
const cors = require('cors')  // pour autoriser les futurs frontent (REACT/FLUTTER) à parler avec notre api
const { limiteurGenerique } = require('./config/rateLimiter');
const configurerSwagger = require('./config/swagger');
// 🔧 REFACTORING: Import unique de globalRouter (ligne dupliquée supprimée)
const globalRouter = require('./routes'); // Appelle automatiquement le dossier src/routes/index.js

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

// 2. Limitation du débit globale contre le spamming de l'API
app.use(limiteurGenerique);

// permet express de lire le format JSON envoyé par le client posstman/Mobile/react
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// 4. Initialisation de la documentation d'API interactive (/api-docs)
configurerSwagger(app);

// 🔀 Point d'ancrage unique de l'API
app.use('/api/unipay', globalRouter);

// route de test pour verifer que le serveur fonctionne correctement
app.get('/', (req, res)=>{
    res.json({message: "Bienvenue sur l'API UniPay ! 🚀"});
})


// --- GESTION DES ERREURS ---

// on place toujours le Middleware de gestion des erreurs à la fin pour capturer toutes les erreurs du système
app.use(errorMiddleware)

module.exports = app