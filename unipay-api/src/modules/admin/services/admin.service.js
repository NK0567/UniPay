const adminRepository = require("../repositories/admin.repository");
const prisma = require("../../../database/prisma");
const currencyHelper = require("../../../helpers/currency.helper");

class AdminService {
  /**
   * 📊 GÉNÉRATION DU RAPPORT DASHBOARD ULTIME (MONITORING 360°)
   * @param {string} adminId - ID de l'admin connecté pour localiser son pays/sa devise cible
   */
  async genererRapportDashboard(adminId) {
    // Récupération des données brutes
    const toutesLesTransactions = await adminRepository.trouverToutesLesTransactions();
    const agregateursBD = await adminRepository.listerTousLesAgregateurs();

    // Détermination dynamique REELLE de la devise de l'admin (Sans aucune valeur par défaut)
    if (!adminId) {
      throw new Error("L'identifiant de l'administrateur (adminId) est requis pour générer le rapport dans sa devise.");
    }

    const adminProfil = await prisma.utilisateur.findUnique({
      where: { id: adminId },
      select: { telephone: true, pays: true }
    });

    if (!adminProfil) {
      throw new Error("Impossible de générer le rapport : Profil administrateur introuvable.");
    }

    const deviseAdmin = currencyHelper.getCurrencyByPhoneOrCountry(adminProfil.telephone, adminProfil.pays);

    if (!deviseAdmin) {
      throw new Error(`Impossible de déterminer la devise locale pour le pays [${adminProfil.pays}] ou le numéro [${adminProfil.telephone}].`);
    }

    // 1. 👥 MONITORING DES UTILISATEURS
    const totalUtilisateurs = await prisma.utilisateur.count();
    const utilisateursSuspendus = await prisma.utilisateur.count({ where: { statutCompte: "SUSPENDU" } });
    const utilisateursActifs = await prisma.utilisateur.count({ where: { statutCompte: "ACTIF" } });
    const utilisateursEnAttenteAprobation = await prisma.utilisateur.count({ where: { statutKYC: "NON_VERIFIE" } });

    // 2. 🏦 MASSE MONÉTAIRE GLOBAL (Dynamisé selon la devise système ou admin)
    const sommePortefeuilles = await prisma.portefeuille.aggregate({ _sum: { solde: true } });
    const coffreGlobal = await prisma.coffreUniPay.findUnique({ where: { id: 'global_vault' } });
    const argentCirculantTotal = parseFloat(sommePortefeuilles._sum.solde || 0) + parseFloat(coffreGlobal?.cumulGainsXAF || 0);

    // 3. 🐷 MONITORING ÉPARGNE & CARTES
    const sommeEpargnesEnCours = await prisma.epargne?.aggregate({ _sum: { montantAccumule: true }, where: { statut: "EN_COURS" } });
    const nombreEpargnantsActifs = (await prisma.epargne?.distinct({ by: ['utilisateurId'], where: { statut: "EN_COURS" } }))?.length || 0;
    const cartesAbonnéesCount = await prisma.carteVirtuelle?.count() || 0;
    const cartesActivesCount = await prisma.carteVirtuelle?.count({ where: { statut: "ACTIVE" } }) || 0;

    // 4. 📊 INITIALISATION DES COMPTEURS ET FLUX DÉTAILLÉS
    let volumeTransfereTotal = 0;
    let volumeLienPaiementTotal = 0;
    let totalPaiementsDevisesIdentiques = 0;

    // États des transactions
    let transactionsReussiesCount = 0;
    let transactionsEchoueesCount = 0;
    const detailsEchecs = {};

    // Ventilation des bénéfices nets UniPay
    let revDepots = 0;
    let revRetraits = 0;
    let revLienPaiementP2P = 0;
    let revConversionSpread = 0;
    let revCartesVirtuellesAbonnement = 0;
    let revCartesVirtuellesPaiement = 0;
    let revBlameEpargneStricte = 0;

    const revenusParAgregateur = {};
    const revenusParPays = {};
    const revenusParOperateur = {};

    // 5. 🔄 ANALYSE DU FLUX DES TRANSACTIONS
    for (const tx of toutesLesTransactions) {
      // On utilise le montant converti ou de base de la transaction sans forcer le libellé XAF
      const montantBase = tx.montantConverti ? parseFloat(tx.montantConverti) : parseFloat(tx.montant || 0);

      // ---- TRACE A : ANALYSE DES ÉCHECS / SUCCÈS OPÉRATIONNELS ----
      if (tx.statut === "ECHEC") {
        transactionsEchoueesCount++;
        const motif = tx.motifEchec || "MOTIF_INCONNU";
        detailsEchecs[motif] = (detailsEchecs[motif] || 0) + 1;
        continue;
      }

      // Si on arrive ici, la transaction est un SUCCÈS
      transactionsReussiesCount++;
      volumeTransfereTotal += montantBase;

      // ---- TRACE B : FLUX SUR LES LIENS DE PAIEMENT ----
      if (tx.lienPaiementId || tx.type === "LIEN_PAIEMENT") {
        volumeLienPaiementTotal += montantBase;
      }

      // ---- TRACE C : TRANSACTIONS SANS CONVERSION ----
      if (tx.deviseSource && tx.deviseCible && tx.deviseSource === tx.deviseCible) {
        totalPaiementsDevisesIdentiques++;
      }

      // ---- TRACE D : CALCULS ET VENTILATION FINANCIÈRE DES GAINS NETS ----
      const fraisBase = parseFloat(tx.frais || 0);
      const spreadBase = parseFloat(tx.gainSpread || 0);

      let commissionPartenaire = 0;
      if (tx.agregateur) {
        const pct = parseFloat(tx.agregateur.commissionPct || 0);
        const fraisFixes = parseFloat(tx.agregateur.fraisFixes || 0);
        commissionPartenaire = (montantBase * pct) + fraisFixes;
      }

      const gainNetUniPay = (fraisBase + spreadBase) - commissionPartenaire;

      switch (tx.type) {
        case "DEPOT": revDepots += gainNetUniPay; break;
        case "RETRAIT": revRetraits += gainNetUniPay; break;
        case "TRANSFERT":
        case "LIEN_PAIEMENT": revLienPaiementP2P += gainNetUniPay; break;
        case "ABONNEMENT_CARTE": revCartesVirtuellesAbonnement += gainNetUniPay; break;
        case "PAIEMENT_CARTE": revCartesVirtuellesPaiement += gainNetUniPay; break;
        case "RUPTURE_EPARGNE_STRICTE": revBlameEpargneStricte += gainNetUniPay; break;
        default: revLienPaiementP2P += gainNetUniPay;
      }

      if (spreadBase > 0) revConversionSpread += spreadBase;

      const nomAgreg = tx.agregateur ? tx.agregateur.nom : "INTERNE_UNIPAY";
      revenusParAgregateur[nomAgreg] = (revenusParAgregateur[nomAgreg] || 0) + gainNetUniPay;

      // ... (Fin de tes switch et calculs d'opérateurs juste au-dessus)
      if (tx.agregateur) {
        const operateur = tx.agregateur.nom.split('_')[0] || "AUTRE";
        revenusParOperateur[operateur] = (revenusParOperateur[operateur] || 0) + gainNetUniPay;
      } else {
        revenusParOperateur["INTERNE"] = (revenusParOperateur["INTERNE"] || 0) + gainNetUniPay;
      }

      // 🎯 REMPLACE TOUTE LA FIN DE LA BOUCLE PAR CE BLOC UNIQUE (Supprime l'ancienne constante pays)
      const paysOperationNet = tx.paysOperation || tx.agregateur?.pays;

      if (paysOperationNet) {
        revenusParPays[paysOperationNet] = (revenusParPays[paysOperationNet] || 0) + gainNetUniPay;
      } else {
        revenusParPays["NON_DEFINI"] = (revenusParPays["NON_DEFINI"] || 0) + gainNetUniPay;
      }

    } // 👈 Fin de la boucle for (toutesLesTransactions)
    const montantGlobalBeneficeNet = revDepots + revRetraits + revLienPaiementP2P + revConversionSpread + revCartesVirtuellesAbonnement + revCartesVirtuellesPaiement + revBlameEpargneStricte;

    // Traduction dynamique de la liste des agrégateurs
    const listeAgregateursDashboard = agregateursBD.map(ag => {
      // Utilisation du helper pour lier le symbole monétaire exact selon le pays de l'agrégateur
      const deviseAgreg = currencyHelper.getCurrencyByPhoneOrCountry(null, ag.pays)
      if (!deviseAgreg) {
        throw new Error(`Configuration manquante : Impossible de détecter la devise pour l'agrégateur ${ag.nom} avec le pays [${ag.pays}].`);
      }

      return {
        id: ag.id,
        nom: ag.nom,
        type: ag.type,
        pays: ag.pays,
        commissionConfiguration: `${(parseFloat(ag.commissionPct) * 100).toFixed(2)}%`,
        fraisFixesConfiguration: `${parseFloat(ag.fraisFixes || 0)} ${deviseAgreg}`, // 💡 Fin du XAF en dur
        statut: ag.statut,
        revenuGenereNetLocal: Math.round(revenusParAgregateur[ag.nom] || 0),
        deviseAgreg: deviseAgreg
      };
    });

    return {
      metadataReporting: {
        devisePrincipaleDashboard: deviseAdmin
      },
      cardsGlobales: {
        nombreTotalUtilisateurs: totalUtilisateurs,
        argentCirculantDansUniPay: Math.round(argentCirculantTotal),
        volumeTransfereTotal: Math.round(volumeTransfereTotal),
        montantGlobalBeneficeNet: Math.round(montantGlobalBeneficeNet)
      },
      analyseFluxSpecifiques: {
        volumeCirculeLienPaiement: Math.round(volumeLienPaiementTotal),
        nombrePaiementsSansConversion: totalPaiementsDevisesIdentiques
      },
      santeDuReseau: {
        transactionsReussies: transactionsReussiesCount,
        transactionsEchouees: transactionsEchoueesCount,
        tauxSuccesGlobal: toutesLesTransactions.length > 0
          ? `${((transactionsReussiesCount / toutesLesTransactions.length) * 100).toFixed(2)}%`
          : "0%",
        repartitionDetailsEchecs: detailsEchecs
      },
      monitoringUtilisateurs: {
        actifs: utilisateursActifs,
        suspendus: utilisateursSuspendus,
        enAttenteAprobation: utilisateursEnAttenteAprobation
      },
      monitoringEpargne: {
        sommeTotaleEpargnesEnCours: Math.round(sommeEpargnesEnCours?._sum?.montantAccumule || 0),
        nombreEpargnantsActifs: nombreEpargnantsActifs
      },
      monitoringCartesVirtuelles: {
        nombreTotalAbonnes: cartesAbonnéesCount,
        nombreCartesActives: cartesActivesCount
      },
      traçabiliteRevenusDetailles: {
        beneficeDepots: Math.round(revDepots),
        beneficeRetraits: Math.round(revRetraits),
        beneficePaiementInterneEtLien: Math.round(revLienPaiementP2P),
        beneficeConversionSpread: Math.round(revConversionSpread),
        beneficeCartesAbonnement: Math.round(revCartesVirtuellesAbonnement),
        beneficeCartesPaiementEnLigne: Math.round(revCartesVirtuellesPaiement),
        beneficeBlameRuptureEpargne: Math.round(revBlameEpargneStricte)
      },
      revenusParPays,
      revenusParOperateur,
      listeAgregateursDashboard
    };
  }

  /**
   * 👤 GESTION DES UTILISATEURS (ACTIONS DIRECTES ADMIN)
   */
  async modifierStatutUtilisateur(utilisateurId, nouveauStatut) {
    return await prisma.utilisateur.update({
      where: { id: utilisateurId },
      data: { statutCompte: nouveauStatut }
    });
  }

  async consularProfilEtSoldeUtilisateur(utilisateurId) {
    return await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        telephone: true,
        statutCompte: true,
        statutKYC: true,
        role: true,
        pays: true,
        dateCreation: true,
        portefeuille: {
          select: {
            id: true,
            solde: true,
            devise: true,
            statut: true
          }
        }
      }
    });
  }

  /**
   * 📈 DÉCISION DE COMMISSIONS EN DIRECT
   */
  async configurerFraisSysteme(cleParametre, valeurParametre) {
    return await adminRepository.sauvegarderConfig(
      cleParametre,
      valeurParametre,
      "FINANCIER",
      "Ajustement dynamique de commission via Dashboard Admin"
    );
  }

  // Consulter toutes les commissions
  async listerCommissions() {
    const configs = await adminRepository.obtenirConfigurationsFinancieres();
    // On transforme le tableau en un objet clé/valeur propre et facile à manipuler pour le Frontend
    const commissions = {};
    configs.forEach(cfg => {
      commissions[cfg.cle] = {
        valeur: parseFloat(cfg.valeur),
        description: cfg.description
      };
    });
    return commissions;
  }

  // Modifier plusieurs commissions d'un coup
  async mettreAJourCommissions(listeCommissions) {
    // listeCommissions est un objet contenant { FRAIS_DEPOT_PCT: 1.8, FRAIS_RETRAIT_PCT: 1.2, ... }
    const promesses = Object.entries(listeCommissions).map(([cle, valeur]) => {
      if (valeur === undefined || valeur === null) return null;
      
      return adminRepository.sauvegarderConfig(
        cle.toUpperCase().trim(),
        valeur,
        "FINANCIER",
        undefined // Le "update" d'upsert n'écrasera pas la description existante
      );
    });

    await Promise.all(promesses.filter(p => p !== null));
    return await this.listerCommissions(); // On renvoie la liste mise à jour
  }

  async executerClotureJournaliere(adminId) {
    const rapport = await this.genererRapportDashboard(adminId);
    const montantAverser = rapport.cardsGlobales.montantGlobalBeneficeNet;

    if (montantAverser <= 0) {
      throw new Error("Le solde des bénéfices nets à reverser est à 0.");
    }

    const portefeuilleAdmin = await adminRepository.obtenirPortefeuilleAdmin();
    if (!portefeuilleAdmin) {
      throw new Error("Impossible de localiser le portefeuille de l'administrateur principal.");
    }

    const dateJour = new Date().toLocaleDateString('fr-FR');
    const logMsg = `Clôture automatique du ${dateJour} - Versement des bénéfices nets UniPay`;

    return await adminRepository.executerVirementGains(portefeuilleAdmin.id, montantAverser, logMsg);
  }

  async recupererFondsDuCoffre(adminId) {
    return await prisma.$transaction(async (tx) => {
      const coffre = await tx.coffreUniPay.findUnique({
        where: { id: 'global_vault' }
      });

      if (!coffre || parseFloat(coffre.cumulGainsXAF) <= 0) {
        throw new Error("Le coffre-fort UniPay ne contient aucun fonds en attente actuellement.");
      }

      const totalARecuperer = parseFloat(coffre.cumulGainsXAF);

      const walletAdmin = await tx.portefeuille.findFirst({
        where: { utilisateurId: adminId }
      });

      if (!walletAdmin || !walletAdmin.devise) {
        throw new Error("Impossible de localiser votre portefeuille admin ou sa devise associée.");
      }

      const deviseCompteAdmin = walletAdmin.devise; // Lecture directe et stricte de la base de données

      await tx.portefeuille.update({
        where: { id: walletAdmin.id },
        data: { solde: { increment: totalARecuperer } }
      });

      await tx.coffreUniPay.update({
        where: { id: 'global_vault' },
        data: { cumulGainsXAF: 0.0000 }
      });

      return {
        montantRecupere: totalARecuperer,
        devise: deviseCompteAdmin, // 💡 Dynamisé à la place de "XAF" en dur
        message: `La totalité des bénéfices orphelins (${totalARecuperer} ${deviseCompteAdmin}) a été reversée dans votre portefeuille.`
      };
    });
  }

  async ajouterNouvelAgregateur(data) {
    return await adminRepository.creerAgregateur(data);
  }

  async basculerAgregateur(id, statut) {
    return await adminRepository.mettreAJourStatutAgregateur(id, statut);
  }
}

module.exports = new AdminService();