const epargneService = require('../services/epargne.service');
const epargneRepository = require('../repositories/epargne.repository');
const prisma = require('../../../database/prisma');
const currencyHelper = require('../../../helpers/currency.helper'); // Ton helper de devise

class EpargneController {
  
  async creer(req, res) {
    try {
      const { libelle, montantCible, type, sousType } = req.body;

      if (!libelle || !montantCible) {
        return res.status(400).json({ success: false, error: "Le libellé et le montant cible sont requis." });
      }

      const utilisateur = await prisma.utilisateur.findUnique({
        where: { id: req.user.id },
        include: { portefeuille: true }
      });

      if (!utilisateur || !utilisateur.portefeuille) {
        return res.status(404).json({ success: false, error: "Portefeuille introuvable." });
      }

      // 1. Création en Base de données
      const nouvelObjectif = await epargneRepository.creerObjectif({
        utilisateurId: req.user.id,
        portefeuilleId: utilisateur.portefeuille.id,
        libelle,
        montantCible: parseFloat(montantCible),
        type: type || "SIMPLE",
        sousType: sousType || "LEGERE"
      });

      // 2. Génération dynamique des projections financières
      const cible = parseFloat(nouvelObjectif.montantCible);
      
      // Récupération de la devise dynamique
      let geo = currencyHelper.detecterParTelephone(utilisateur.telephone);
      const monnaie = utilisateur.portefeuille?.devise || geo.devise || "XAF";

      // Simulation basée sur des durées standards (ex: objectif à atteindre en 6 mois)
      const dureeMoisStandard = 6;
      const cotisationMensuelle = Math.ceil(cible / dureeMoisStandard);
      const cotisationHebdomadaire = Math.ceil(cotisationMensuelle / 4);
      const cotisationQuotidienne = Math.ceil(cible / (dureeMoisStandard * 30));

      // 3. Construction de la réponse enrichie
      return res.status(201).json({
        success: true,
        donnees: nouvelObjectif,
        simulation: {
          message: `Pour atteindre votre objectif de ${cible.toLocaleString()} ${monnaie}, voici vos plans de route personnalisés :`,
          plans: {
            quotidien: {
              frequence: "Chaque jour",
              montant: cotisationQuotidienne,
              dureeEstimee: `${dureeMoisStandard * 30} jours`,
              phrase: `En cotisant chaque jour la somme de ${cotisationQuotidienne.toLocaleString()} ${monnaie}, il vous faudra ${dureeMoisStandard * 30} jours pour atteindre votre objectif.`
            },
            hebdomadaire: {
              frequence: "Chaque semaine",
              montant: cotisationHebdomadaire,
              dureeEstimee: `${dureeMoisStandard * 4} semaines`,
              phrase: `En cotisant chaque semaine la somme de ${cotisationHebdomadaire.toLocaleString()} ${monnaie}, il vous faudra ${dureeMoisStandard * 4} semaines pour atteindre votre objectif.`
            },
            mensuel: {
              frequence: "Chaque mois",
              montant: cotisationMensuelle,
              dureeEstimee: `${dureeMoisStandard} mois`,
              phrase: `En cotisant chaque mois la somme de ${cotisationMensuelle.toLocaleString()} ${monnaie}, il vous faudra ${dureeMoisStandard} mois pour atteindre votre objectif.`
            }
          }
        }
      });

    } catch (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
  }


  // 📥 ALIMENTATION D'UN OBJECTIF (MANUELLE OU AUTOMATIQUE)
  async alimenter(req, res) {
    try {
      // req.user.id provient de ton authMiddleware
      const resultat = await epargneService.alimenterObjectif(req.user.id, req.body);
      return res.status(200).json(resultat);
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 📤 RETRAIT / LIQUIDATION DU COFFRE
  async liquider(req, res) {
    try {
      const { id } = req.params;
      const { force } = req.query; // ?force=true pour valider et passer outre le verrou strict

      const resultat = await epargneService.liquiderObjectif(req.user.id, id, force === 'true');
      return res.status(200).json(resultat);
    } catch (error) {
      // Interception de l'alerte de discipline levée par le service
      if (error.message === "PÉNALITÉ_REQUIS") {
        return res.status(202).json({
          success: false,
          code: "DISCIPLINE_PUNISHMENT",
          message: "Attention : Votre objectif n'est pas encore atteint. Briser cette épargne stricte entraînera une pénalité de discipline de 0.05%."
        });
      }
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  // 🤖 TOGGLE ÉPARGNE INTELLIGENTE (Activation / Désactivation du prélèvement automatique)
  async basculerToggle(req, res) {
    try {
      const { id } = req.params; // ID de l'objectif d'épargne
      const { activer } = req.body; // boolean : true ou false

      if (typeof activer !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          error: "Le paramètre 'activer' doit être un booléen." 
        });
      }

      await epargneService.basculerAutoPrelevement(req.user.id, id, activer);

      return res.status(200).json({
        success: true,
        message: activer
          ? "Le système d'épargne intelligente et de prélèvement automatique a été activé avec succès."
          : "Le prélèvement automatique a été désactivé. Votre épargne reste active en mode manuel."
      });
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}

module.exports = new EpargneController();