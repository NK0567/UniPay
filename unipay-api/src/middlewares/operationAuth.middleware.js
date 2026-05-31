const bcrypt = require('bcrypt');
const prisma = require('../database/prisma');

async function verifierVerrouOperation(req, res, next) {
  try {
    const utilisateurId = req.user?.id || req.body.utilisateurId || req.headers['x-user-id'];
    
    // 🎛️ RACCORDEMENT AUX DEUX OPTIONS DE L'INTERFACE
    const pinRecu = req.headers['x-operation-pin']; 
    const biometrieValide = req.headers['x-biometric-verified'] === 'true';

    if (!utilisateurId) {
      return res.status(401).json({ success: false, error: "Identification requise." });
    }

    // Si aucune des deux méthodes n'est fournie
    if (!pinRecu && !biometrieValide) {
      return res.status(403).json({ 
        success: false, 
        error: "Sécurité : Veuillez saisir votre code PIN ou valider par biométrie." 
      });
    }

    const utilisateur = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });
    if (!utilisateur || !utilisateur.codePIN) {
      return res.status(400).json({ success: false, error: "Sécurité non configurée sur ce compte." });
    }

    // 🟢 CAS 1 : L'utilisateur a choisi la Biométrie sur l'interface
    if (biometrieValide) {
      // Le téléphone a validé l'empreinte/visage localement, on autorise le passage
      return next();
    }

    // 🟢 CAS 2 : L'utilisateur a tapé son code PIN sur le clavier dynamique
    const pinValide = await bcrypt.compare(pinRecu, utilisateur.codePIN);
    if (!pinValide) {
      return res.status(401).json({ success: false, error: "Code PIN de sécurité incorrect." });
    }

    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = verifierVerrouOperation;