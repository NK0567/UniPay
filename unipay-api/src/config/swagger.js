const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

// Chargement du fichier JSON de documentation que nous avons créé
const cheminFichierDoc = path.join(__dirname, '../docs/openapi.json');
let documentOpenApi = {};

try {
  const contenuFichier = fs.readFileSync(cheminFichierDoc, 'utf8');
  documentOpenApi = JSON.parse(contenuFichier);
} catch (error) {
  // S'il n'existe pas encore ou est vide, initialisation d'un objet racine
  documentOpenApi = { openapi: "3.0.0", info: { title: "UniPay API", version: "1.0.0" }, paths: {} };
}

function configurerDocumentationSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(documentOpenApi));
}

module.exports = configurerDocumentationSwagger;