const transferLinkService = require('../services/lien.service');
const prisma = require('../../../database/prisma');

class TransferLinkController {
  async genererLien(req, res, next) {
    try {
      const utilisateurId = req.user.id;

      // Récupération du portefeuille de l'utilisateur connecté en BD
      const portefeuille = await prisma.portefeuille.findFirst({
        where: { utilisateurId: utilisateurId }
      });

      if (!portefeuille) {
        return res.status(400).json({ 
          success: false, 
          error: "Impossible de générer un lien : Aucun portefeuille associé à votre compte." 
        });
      }

      const resultat = await transferLinkService.genererLienSigne(utilisateurId, portefeuille.id);
      
      return res.status(201).json({ 
        success: true, 
        data: resultat 
      });
    } catch (error) {
      // Aligné avec le standard bancaire : on passe l'erreur au middleware global
      next(error);
    }
  }

  async inspecterLien(req, res, next) {
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
    } catch (error) {
      next(error);
    }
  }

  async payerLien(req, res, next) {
    try {
      const utilisateurPayeurId = req.user.id; // Récupéré du middleware d'authentification JWT
      
      const { codeUnique, signature, montant } = req.body;

      // ⚡ CAPTURE DU CONTEXTE RÉSEAU (Crucial pour les Audit Logs de conformité)
      const contextRequest = {
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      };

      // On injecte le contextRequest en 3ème paramètre sans altérer la logique existante
      const resultat = await transferLinkService.executerPaiementLienSecurise(
        utilisateurPayeurId, 
        { codeUnique, signature, montant },
        contextRequest
      );

      return res.status(200).json({
        success: true,
        message: "Votre paiement a été traité et validé avec succès.",
        data: resultat
      });

    } catch (error) {
      // Renvoie l'erreur directement au error.middleware.js pour écriture dans errors.log
      next(error);
    }
  }
}

module.exports = new TransferLinkController();