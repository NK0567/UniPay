const prisma = require('../../../database/prisma');
const analyseFluxService = require('./analyse.service');

class EpargneService {

  /**
   * 📥 ALIMENTATION MANUELLE OU INTELLIGENTE
   */
  async alimenterObjectif(utilisateurId, { objectifId, montant }) {
    const montantSaisi = parseFloat(montant);
    if (isNaN(montantSaisi) || montantSaisi <= 0) throw new Error("Montant invalide.");

    return await prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.findUnique({
        where: { id: utilisateurId },
        include: { portefeuille: true }
      });

      if (!utilisateur || !utilisateur.portefeuille) throw new Error("Utilisateur ou portefeuille introuvable.");

      const objectif = await tx.objectifEpargne.findFirst({
        where: { id: objectifId, portefeuilleId: utilisateur.portefeuille.id }
      });

      if (!objectif || objectif.statut !== "EN_COURS") throw new Error("Objectif introuvable ou déjà clôturé.");

      const soldePrincipal = parseFloat(utilisateur.portefeuille.solde);
      if (soldePrincipal < montantSaisi) throw new Error("Solde principal insuffisant.");

      // 1. Débiter le portefeuille de l'utilisateur
      await tx.portefeuille.update({
        where: { id: utilisateur.portefeuille.id },
        data: { solde: { decrement: montantSaisi } }
      });

      // 2. Traitement mathématique des cumuls
      const actuel = parseFloat(objectif.montantActuel);
      const cible = parseFloat(objectif.montantCible);
      const nouveauMontantActuel = actuel + montantSaisi;
      const estAtteint = nouveauMontantActuel >= cible;

      // 3. Mettre à jour l'objectif d'épargne
      const objectifMisAJour = await tx.objectifEpargne.update({
        where: { id: objectif.id },
        data: {
          montantActuel: nouveauMontantActuel,
          statut: estAtteint ? "ATTEINT" : "EN_COURS"
        }
      });

      return {
        succes: true,
        objectif: objectifMisAJour,
        estAtteint,
        devise: utilisateur.portefeuille.devise
      };
    });
  }

  /**
   * 📤 RETRAIT / LIQUIDATION (Avec gestion de la discipline stricte)
   */
  async liquiderObjectif(utilisateurId, objectifId, obligerRetrait = false) {
    return await prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.findUnique({
        where: { id: utilisateurId },
        include: { portefeuille: true }
      });

      if (!utilisateur || !utilisateur.portefeuille) throw new Error("Utilisateur ou portefeuille introuvable.");

      const objectif = await tx.objectifEpargne.findFirst({
        where: { id: objectifId, portefeuilleId: utilisateur.portefeuille.id }
      });

      if (!objectif || objectif.statut === "CLOTURE" || objectif.statut === "LIQUIDE") {
        throw new Error("Cet objectif n'existe pas ou a déjà été liquidé.");
      }

      const estStricte = objectif.sousType === "STRICTE";
      const actuel = parseFloat(objectif.montantActuel);
      const cible = parseFloat(objectif.montantCible);
      const estIncomplet = actuel < cible;

      let penalite = 0;
      let montantARestituer = actuel;

      // 🛡️ PROTOCOLE DISCIPLINE : Si l'épargne est stricte et non terminée
      if (estStricte && estIncomplet) {
        if (!obligerRetrait) {
          throw new Error("PÉNALITÉ_REQUIS"); // Intercepté par le contrôleur pour confirmation client
        }

        // 1. Récupérer la configuration du blâme en BD
        const configBlame = await tx.configurationSysteme.findUnique({
          where: { cle: "FRAIS_BLAME_EPARGNE_PCT" }
        });

        // Traité comme une valeur en pourcentage (Fallback à 5.0%)
        const pourcentageBlame = configBlame ? parseFloat(configBlame.valeur) : 5.0;
        
        // 2. Calcul du montant de la pénalité retenue
        penalite = parseFloat(((actuel * pourcentageBlame) / 100).toFixed(2));
        montantARestituer = actuel - penalite;

        console.log(`[Rupture Disciplinaire] ${pourcentageBlame}% appliqué sur ${actuel}. Retenu : ${penalite}`);
      }

      // 1. Clôturer définitivement l'objectif
      await tx.objectifEpargne.update({
        where: { id: objectif.id },
        data: { statut: "CLOTURE", montantActuel: 0 }
      });

      // 2. Restituer le capital (Net de pénalité) sur le portefeuille principal
      await tx.portefeuille.update({
        where: { id: utilisateur.portefeuille.id },
        data: { solde: { increment: montantARestituer } }
      });

      // 3. Versement de la pénalité sur le compte de la Fintech (ADMIN)
      if (penalite > 0) {
        const adminPortefeuille = await tx.portefeuille.findFirst({
          where: { utilisateur: { role: "ADMIN" } }
        });
        
        if (adminPortefeuille) {
          await tx.portefeuille.update({
            where: { id: adminPortefeuille.id },
            data: { solde: { increment: penalite } }
          });
        }
      }

      return {
        succes: true,
        montantRestitue: montantARestituer,
        penalitePrelevee: penalite,
        devise: utilisateur.portefeuille.devise
      };
    });
  }

  /**
   * 🤖 CONFIGURATION DU TOGGLE AUTOMATIQUE SÉCURISÉ
   */
  async basculerAutoPrelevement(utilisateurId, objectifId, activer) {
    let donneesMiseAJour = { autoPrelevement: activer };

    if (activer) {
      const analyse = await analyseFluxService.analyserCapaciteEpargne(utilisateurId);
      donneesMiseAJour = {
        ...donneesMiseAJour,
        montantPrelevementAuto: analyse.montantPrelevement,
        pourcentagePrelevement: analyse.pourcentage,
        derniereAnalyseFlux: new Date()
      };
    }

    return await prisma.objectifEpargne.updateMany({
      where: {
        id: objectifId,
        portefeuille: { utilisateurId },
        type: "INTELLIGENTE"
      },
      data: donneesMiseAJour
    });
  }
}

module.exports = new EpargneService();