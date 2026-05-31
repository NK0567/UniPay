// Upload :
/*
    * pièces identité
    * KYC
    * justificatifs
    * factures
    * etc...
*/
const multer = require('multer');
const path = require('path');

// Configuration du stockage temporaire
const stockage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, '../../uploads/')); // Racine temporaire d'upload
  },
  filename: (req, file, callback) => {
    const prefixeUnique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, prefixeUnique + path.extname(file.originalname));
  }
});

// Filtre de sécurité sur le type de fichier
const filtreFichier = (req, file, callback) => {
  const formatsAutorises = /jpeg|jpg|png|pdf/;
  const extensionValide = formatsAutorises.test(path.extname(file.originalname).toLowerCase());
  const mimeTypeValide = formatsAutorises.test(file.mimetype);

  if (extensionValide && mimeTypeValide) {
    return callback(null, true);
  }
  callback(new Error('Le fichier doit être un format image (JPG/PNG) ou un PDF.'));
};

const configurationMulter = multer({
  storage: stockage,
  fileFilter: filtreFichier,
  limits: { fileSize: 5 * 1024 * 1024 } // Limite stricte de 5 Mo par document
});

module.exports = configurationMulter;