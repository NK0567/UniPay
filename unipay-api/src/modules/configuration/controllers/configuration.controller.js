const configurationService = require('../services/configuration.service');
const configurationRepository = require('../repositories/configuration.repository');
const currencyHelper = require('../../../helpers/currency.helper'); 
const prisma = require('../../../database/prisma');

class ConfigurationController {
  /**
   * GET /api/unipay/configuration
   * Récupère toutes les règles et injecte les métadonnées de la devise de l'admin connecté
   */
  async listerToutes(req, res, next) {
    try {
      // 1. Récupération des données brutes
      const configsDictionnaire = await configurationService.obtenirConfigurationGlobale();
      const configsTableauRaw = await configurationRepository.obtenirToutes();
      
      // 2. Détection dynamique de la devise de l'admin connecté (Zéro valeur en dur)
      let deviseAdmin = null;

      if (req.user?.id) {
        const portefeuille = await prisma.portefeuille.findUnique({
          where: { utilisateurId: req.user.id },
          select: { devise: true }
        });
        if (portefeuille) {
          deviseAdmin = portefeuille.devise;
        }
      }

      if (!deviseAdmin && req.user) {
        deviseAdmin = req.user.portefeuille?.devise || req.user.devise;
      }

      if (!deviseAdmin) {
        const telephoneAdmin = req.user?.telephone || req.user?.phone; 
        if (telephoneAdmin) {
          deviseAdmin = currencyHelper.detecterParTelephone(telephoneAdmin);
        }
      }

      // Sécurité : blocage si l'utilisateur n'a aucun ancrage monétaire valide
      if (!deviseAdmin) {
        return res.status(400).json({ 
          success: false, 
          message: "Avertissement système : Impossible de déterminer la devise associée à l'administrateur connecté." 
        });
      }

      return res.status(200).json({ 
        success: true, 
        data: {
          dictionnaire: configsDictionnaire, // Format { APP_NAME: "UniPay" } pour lecture directe au front
          liste: configsTableauRaw          // Format tableau complet pour les tableaux éditables
        },
        meta: {
          deviseAdmin,
          tauxConversion: 1.0, 
          deviseReferenceSysteme: deviseAdmin
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/unipay/configuration/modifier
   * Permet de mettre à jour un paramètre unique
   */
  async modifierParametre(req, res, next) {
    try {
      const { cle, valeur, description, type } = req.body;
      const config = await configurationService.mettreAJourParametre(cle, valeur, description, type || 'GLOBAL');
      
      return res.status(200).json({
        success: true,
        message: `La configuration ${cle} a été mise à jour avec succès.`,
        data: config
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/unipay/configuration/bloc
   * Sauvegarde un ensemble complet de clés (ex: Formulaire complet de Branding ou Design)
   */
  async sauvegarderBlocConfig(req, res, next) {
    try {
      const configurationMiseAJour = await configurationService.sauvegarderParametresEnBloc(req.body);
      return res.status(200).json({
        success: true,
        message: "Toutes les configurations système et de branding ont été synchronisées.",
        data: configurationMiseAJour
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ConfigurationController();