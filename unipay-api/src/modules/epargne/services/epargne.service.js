const prisma = require('../../../database/prisma');
// const analyseFluxService = require('./analyse.service');

class EpargneService {

  // 📥 ALIMENTATION MANUELLE (Simple ou Intelligente)
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

      // 1. Débiter le portefeuille
      await tx.portefeuille.update({
        where: { id: utilisateur.portefeuille.id },
        data: { solde: { decrement: montantSaisi } }
      });

      // 2. Traitement mathématique sécurisé des types Decimal Prisma
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

      // 4. (Optionnel) Enregistrer le mouvement d'épargne historique ici si ton modèle existe
      // await tx.mouvementEpargne.create({ ... });

      return {
        succes: true,
        objectif: objectifMisAJour,
        estAtteint,
        devise: utilisateur.portefeuille.devise
      };
    });
  }

  // 📤 RETRAIT / LIQUIDATION (Avec gestion de la discipline stricte)
  async liquiderObjectif(utilisateurId, objectifId, obligerRetrait = false) {
    return await prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.findUnique({
        where: { id: utilisateurId },
        include: { portefeuille: true }
      });

      const objectif = await tx.objectifEpargne.findFirst({
        where: { id: objectifId, portefeuilleId: utilisateur.portefeuille.id }
      });

      if (!objectif || objectif.statut === "LIQUIDE") throw new Error("Cet objectif n'existe pas ou a déjà été vidé.");

      // Désormais, objectif.sousType fonctionne grâce à la mise à jour Prisma
      const estStricte = objectif.sousType === "STRICTE";
      const actuel = parseFloat(objectif.montantActuel);
      const cible = parseFloat(objectif.montantCible);
      const estIncomplet = actuel < cible;

      let penalite = 0;
      let montantAFiltrer = actuel;

      // 🛡️ PROTOCOLE DISCIPLINE
      if (estStricte && estIncomplet) {
        if (!obligerRetrait) {
          // Ce code d'erreur sera intercepté par ton routeur pour envoyer l'alerte à l'utilisateur
          throw new Error("PÉNALITÉ_REQUIS");
        }
        // Calcul strict des 0.05% de rupture anticipée
        penalite = montantAFiltrer * 0.0005;
        montantAFiltrer -= penalite;
      }

      // 1. Clôturer l'objectif
      await tx.objectifEpargne.update({
        where: { id: objectif.id },
        data: { statut: "CLOTURE" }
      });

      // 2. Restituer le capital disponible sur le portefeuille principal
      await tx.portefeuille.update({
        where: { id: utilisateur.portefeuille.id },
        data: { solde: { increment: montantAFiltrer } }
      });

      // 3. Versement de la pénalité sur le compte d'infrastructure de l'ADMIN
      if (penalite > 0) {
        const admin = await tx.utilisateur.findFirst({
          where: { role: "ADMIN" },
          include: { portefeuille: true }
        });
        if (admin && admin.portefeuille) {
          await tx.portefeuille.update({
            where: { id: admin.portefeuille.id },
            data: { solde: { increment: penalite } }
          });
        }
      }

      return {
        succes: true,
        montantRestitue: montantAFiltrer,
        penalitePrelevee: penalite,
        devise: utilisateur.portefeuille.devise
      };
    });
  }

  // 🤖 ÉPARGNE INTELLIGENTE : Configuration du Toggle d'automatisation

  async basculerAutoPrelevement(utilisateurId, objectifId, activer) {

    // Analyse intelligente des flux
    const analyse = await analyseFluxService
      .analyserCapaciteEpargne(utilisateurId);

    return await prisma.objectifEpargne.updateMany({
      where: {
        id: objectifId,
        utilisateurId,
        type: "INTELLIGENTE"
      },
      data: {
        autoPrelevement: activer,
        montantPrelevementAuto: analyse.montantPrelevement,
        pourcentagePrelevement: analyse.pourcentage,
        derniereAnalyseFlux: new Date()
      }
    });
  }
}

module.exports = new EpargneService();




// 🤖 ÉPARGNE INTELLIGENTE : Configuration du Toggle d'automatisation

  // async basculerAutoPrelevement(utilisateurId, objectifId, activer) {

  //   // Analyse intelligente des flux
  //   const analyse = await analyseFluxService.analyserCapaciteEpargne(utilisateurId);

  //   return await prisma.objectifEpargne.updateMany({
  //     where: {
  //       id: objectifId,
  //       utilisateurId,
  //       type: "INTELLIGENTE"
  //     },
  //     data: {
  //       autoPrelevement: activer,
  //       montantPrelevementAuto: analyse.montantPrelevement,
  //       pourcentagePrelevement: analyse.pourcentage,
  //       derniereAnalyseFlux: new Date()
  //     }
  //   });
  // }