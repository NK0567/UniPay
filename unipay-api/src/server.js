// On importe la configuration de notre application
const app = require('./app');

// On définit le port (3000 par défaut ou celui dans ton fichier .env)
const PORT = process.env.PORT || 3000;

// On lance le serveur
app.listen(PORT, () => {
    console.log(`==========================================`);
    console.log(`✅ Serveur UniPay lancé sur le port : ${PORT}`);
    console.log(`🌍 URL : http://localhost:${PORT}`);
    console.log(`==========================================`);
});