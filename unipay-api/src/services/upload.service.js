const fs = require('fs');
const path = require('path');

class UploadService {
  /**
   * Sécurise et vérifie un fichier uploadé (Ex: Document KYC) avant enregistrement
   */
  validerEtDeplacerFichier(fichierTemporaire, nomOrigine) {
    const extensionsAutorisees = ['.jpg', '.jpeg', '.png', '.pdf'];
    const extension = path.extname(nomOrigine).toLowerCase();

    if (!extensionsAutorisees.includes(extension)) {
      throw new Error("Format de fichier non supporté. Fournir un format JPG, PNG ou PDF.");
    }

    // Génération d'un nom unique pour éviter les collisions
    const nomUnique = `kyc_${Date.now()}${extension}`;
    const cheminDestination = path.join(__dirname, '../../uploads/kyc', nomUnique);

    // Déplacement du fichier du dossier temporaire vers le stockage final
    fs.renameSync(fichierTemporaire, cheminDestination);

    return `/uploads/kyc/${nomUnique}`;
  }
}

module.exports = new UploadService();