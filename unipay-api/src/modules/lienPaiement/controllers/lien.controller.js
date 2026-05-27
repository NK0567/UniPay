const transferLinkService = require('../services/lien.service');
const prisma = require('../../../database/prisma');

class TransferLinkController {
  async genererLien(req, res) {
    try {
      const utilisateurId = req.user.id;

      // 💡 CORRECTION : On va chercher le portefeuille de l'utilisateur connecté en BD
      const portefeuille = await prisma.portefeuille.findFirst({
        where: { utilisateurId: utilisateurId }
      });

      if (!portefeuille) {
        return res.status(400).json({ 
          success: false, 
          error: "Impossible de générer un lien : Aucun portefeuille associé à votre compte." 
        });
      }

      // On passe maintenant les deux identifiants bien réels au service
      const resultat = await transferLinkService.genererLienSigne(utilisateurId, portefeuille.id);
      
        return res.status(201).json({ 
            success: true, 
            data: resultat 
        });
    } catch (e) {
        return res.status(400).json({ 
            success: false, 
            error: e.message 
        });
    }
  }

  async inspecterLien(req, res) {
    try {
      const { codeUnique } = req.params;
      const { sig } = req.query; // Récupère la signature passée dans l'URL (?sig=...)

      if (!sig) {
        return res.status(400).json({ 
            success: false, 
            error: "Jeton de signature manquant. Lien invalide." 
        });
      }

      const resultat = await transferLinkService.inspecterLienEtVerifierSignature(codeUnique, sig);
        return res.status(200).json({ 
            success: true, 
            data: resultat 
        });
    } catch (e) {
        return res.status(400).json({ 
            success: false, 
            error: e.message 
        });
    }
  }

  async payerLien(req, res) {
    try {
      const utilisateurPayeurId = req.user.id; // Récupéré du middleware d'authentification JWT
      
      // 💡 CORRECTION : Extraction explicite des variables du Body Postman
      const { codeUnique, signature, montant } = req.body;

      // On passe l'ID du payeur en premier argument, puis l'objet contenant les données du body
      const resultat = await transferLinkService.executerPaiementLienSecurise(utilisateurPayeurId, {
        codeUnique,
        signature,
        montant
      });

      return res.status(200).json({
        success: true,
        message: "Votre paiement a été traité et validé avec succès.",
        data: resultat
      });

    } catch (error) {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new TransferLinkController();