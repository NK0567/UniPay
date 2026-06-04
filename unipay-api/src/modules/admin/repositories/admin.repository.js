const prisma = require("../../../database/prisma");

class AdminRepository {
  // Récupère toutes les transactions d'un coup pour les algorithmes de ventilation du dashboard
  async trouveTransactionSucces() {
    return await prisma.transaction.findMany({
      where: { statut: "SUCCES" },
      include: {
        agregateur: true,
        walletSource: true
      }
    });
  }

  // Récupère l'historique complet pour alimenter les indicateurs de performance (KPI)
  async trouverToutesLesTransactions() {
    return await prisma.transaction.findMany({
      include: {
        agregateur: true,
        walletSource: true
      }
    });
  }

  // Récupère uniquement les configurations liées aux frais et commissions
  async obtenirConfigurationsFinancieres() {
    return await prisma.configurationSysteme.findMany({
      where: {
        type: "FINANCIER"
      }
    });
  }

  // Met à jour ou crée une configuration (déjà existante dans ton code, assure-toi qu'elle y est)
  async sauvegarderConfig(cle, valeur, type, description) {
    return await prisma.configurationSysteme.upsert({
      where: { cle },
      update: { valeur: valeur.toString() },
      create: { cle, valeur: valeur.toString(), type, description }
    });
  }

  // Création complète d'un agrégateur avec sa commission en % ET ses frais fixes
  async creerAgregateur(data) {
    return await prisma.agregateur.create({
      data: {
        nom: data.nom.toUpperCase(),
        type: data.type, // MOBILE_MONEY, BANQUE, CARTE
        pays: data.pays.toUpperCase(),
        commissionPct: parseFloat(data.commissionPct || 0),
        fraisFixes: parseFloat(data.fraisFixes || 0),
        statut: data.statut || "ACTIF"
      }
    });
  }

  async mettreAJourStatutAgregateur(id, statut) {
    return await prisma.agregateur.update({
      where: { id },
      data: { statut }
    });
  }

  async listerTousLesAgregateurs() {
    return await prisma.agregateur.findMany();
  }

  async obtenirPortefeuilleAdmin() {
    return await prisma.portefeuille.findFirst({
      where: {
        utilisateur: { role: "ADMIN" }
      }
    });
  }

  /**
   * 🔐 Logique atomique de reversement des gains vers le compte admin principal
   * ZÉRO VALEUR EN DUR : Tout est extrait dynamiquement du portefeuille ciblé
   */
  async executerVirementGains(portefeuilleId, montantGains, descriptionLog) {
    return await prisma.$transaction(async (tx) => {

      // 1. Mise à jour du solde et récupération simultanée des infos du portefeuille (et de l'utilisateur lié)
      const portefeuille = await tx.portefeuille.update({
        where: { id: portefeuilleId },
        data: { solde: { increment: montantGains } },
        include: {
          utilisateur: {
            select: { pays: true }
          }
        }
      });

      // Sécurité stricte : Vérification que le portefeuille possède bien une devise configurée
      if (!portefeuille.devise) {
        throw new Error(`Impossible de valider le virement : Le portefeuille d'administration [${portefeuilleId}] n'a pas de devise configurée.`);
      }

      if (!portefeuille.utilisateur?.pays) {
        throw new Error(`Impossible de localiser le pays d'origine de l'administrateur propriétaire du portefeuille.`);
      }

      // Extraction des valeurs réelles pour l'écriture comptable historique
      const deviseCompteAdmin = portefeuille.devise;
      const paysAdmin = portefeuille.utilisateur.pays;

      // 2. Récupération de l'agrégateur interne
      const internalAgreg = await tx.agregateur.findFirst({ where: { nom: "INTERNE" } });

      if (!internalAgreg) {
        throw new Error("L'agrégateur avec le nom 'INTERNE' est requis en base de données pour la clôture.");
      }

      // 3. Génération de l'historique sans aucun fallback statique
      const historiqueTx = await tx.transaction.create({
        data: {
          type: "DEPOT",
          montant: montantGains,
          deviseSource: deviseCompteAdmin,   // 💡 Dynamique : Déduite du portefeuille de l'admin
          deviseCible: deviseCompteAdmin,    // 💡 Dynamique : Pas de "XAF" forcé
          tauxApplique: 1.0,
          montantConverti: montantGains,
          statut: "SUCCES",
          frais: 0,
          gainSpread: 0,
          description: descriptionLog,
          paysOperation: paysAdmin,          // 💡 Dynamique : Déduit du profil réel de l'admin (ex: "SN", "CI", "FR")
          walletSource: {
            connect: { id: portefeuilleId }
          },
          agregateur: {
            connect: { id: internalAgreg.id }
          }
        }
      });

      return { portefeuille, historiqueTx };
    });
  }
}

module.exports = new AdminRepository();