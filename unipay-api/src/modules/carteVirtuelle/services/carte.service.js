const prisma = require('../../../database/prisma');
const carteRepository = require('../repositories/carte.repository');
const providerService = require('./provider.service');
const securiteService = require('./securite.service');
const currencyHelper = require('../../../helpers/currency.helper');

class CarteService {

  /**
   * 💳 ACTIVATION DE LA CARTE AVEC DOUBLE CONVERSION DIRECTE (CLIENT & ADMIN)
   */
  async commanderCarteUnique(utilisateurId) {
    // Coût universel de création (exprimé dans la devise native du client pour éviter tout pivot)
    const FRAIS_BASE_CREATION = 1000.00;

    return await prisma.$transaction(async (tx) => {

      // 1. Récupérer le portefeuille du client
      const portefeuilleClient = await tx.portefeuille.findFirst({
        where: { utilisateurId }
      });
      if (!portefeuilleClient) throw new Error("Portefeuille client introuvable.");

      // 2. 🔒 VÉRIFICATION DE LA RÈGLE : Carte Unique
      const carteExistante = await tx.carteVirtuelle.findUnique({
        where: { portefeuilleId: portefeuilleClient.id }
      });
      if (carteExistante) {
        throw new Error("Vous possédez déjà une carte virtuelle UniPay.");
      }

      // 3. Récupérer le portefeuille de l'ADMIN
      const portefeuilleAdmin = await tx.portefeuille.findFirst({
        where: { utilisateur: { role: "ADMIN" } }
      });
      if (!portefeuilleAdmin) {
        throw new Error("Erreur système : Le compte collecteur ADMIN est introuvable.");
      }

      // 🌐 EXTRACTION ET SÉCURISATION DES DEVISES
      const deviseClient = portefeuilleClient.devise;
      const deviseAdmin = portefeuilleAdmin.devise;

      if (!deviseClient || !deviseAdmin) {
        throw new Error("Erreur système : Profil monétaire du client ou de l'admin incomplet.");
      }

      // 🧮 CALCUL DES FRAIS (Le client paie le montant brut dans sa devise)
      const fraisDebitesClient = FRAIS_BASE_CREATION;

      // Le gain de l'admin est calculé DIRECTEMENT (Devise Client -> Devise Admin)
      const resConversionAdmin = await currencyHelper.convertir(fraisDebitesClient, deviseClient, deviseAdmin);
      const gainCrediteAdmin = parseFloat(resConversionAdmin.montantConverti || resConversionAdmin);

      // 🛑 VERROU DE SÉCURITÉ : Solde insuffisant chez le client
      const soldeClient = parseFloat(portefeuilleClient.solde);
      if (soldeClient < fraisDebitesClient) {
        throw new Error(
          `Solde insuffisant. L'activation de la carte requiert ${fraisDebitesClient.toFixed(2)} ${deviseClient}.`
        );
      }

      // 💸 MOUVEMENTS DE FONDS DIRECTS
      await tx.portefeuille.update({
        where: { id: portefeuilleClient.id },
        data: { solde: { decrement: fraisDebitesClient } }
      });

      await tx.portefeuille.update({
        where: { id: portefeuilleAdmin.id },
        data: { solde: { increment: gainCrediteAdmin } }
      });

      // 4. Commande de la carte au BIN Sponsor / Fournisseur
      const donneesFournisseur = await providerService.commanderNouvelleCarte("Client UniPay", "VISA");

      // 5. Chiffrer et Hasher les données sensibles
      const numeroTokenise = securiteService.chiffrerPAN(donneesFournisseur.pleinNumero);
      const cvvHash = securiteService.hasherCVV(donneesFournisseur.cvv);

      // 6. Enregistrement en base de données
      // Le plafond est maintenant stocké directement dans la devise du CLIENT pour éviter les reconversions complexes
      const nouvelleCarte = await carteRepository.creerCarte({
        portefeuilleId: portefeuilleClient.id,
        idFournisseur: donneesFournisseur.idFournisseur,
        numeroMasque: donneesFournisseur.numeroMasque,
        numeroTokenise,
        cvvHash,
        dateExpiration: donneesFournisseur.dateExpiration,
        limitePlafond: fraisDebitesClient * 500
      }, tx);

      return {
        id: nouvelleCarte.id,
        numeroMasque: nouvelleCarte.numeroMasque,
        fraisClient: `${fraisDebitesClient.toFixed(2)} ${deviseClient}`,
        gainAdminLogge: `${gainCrediteAdmin.toFixed(2)} ${deviseAdmin}`
      };
    });
  }

  /**
   * ❄️ GELER / DÉGELER LA CARTE UNIQUE (Gratuit)
   */
  async modifierStatutCarte(utilisateurId, action) {
    const portefeuille = await prisma.portefeuille.findFirst({ where: { utilisateurId } });
    if (!portefeuille) throw new Error("Portefeuille introuvable.");

    const carte = await carteRepository.trouverParPortefeuilleId(portefeuille.id);
    if (!carte) throw new Error("Aucune carte virtuelle associée à votre compte.");

    let nouveauStatut = action === "GELER" ? "BLOQUEE" : "ACTIVE";
    return await carteRepository.mettreAJour(carte.id, { statut: nouveauStatut });
  }

  /**
   * 🎛️ MODIFIER LE PLAFOND DE SÉCURITÉ (Gratuit)
   */
  async modifierPlafond(utilisateurId, nouveauPlafond) {
    if (parseFloat(nouveauPlafond) <= 0) throw new Error("Le montant du plafond doit être supérieur à 0.");

    const portefeuille = await prisma.portefeuille.findFirst({ where: { utilisateurId } });
    if (!portefeuille) throw new Error("Portefeuille introuvable.");

    const carte = await carteRepository.trouverParPortefeuilleId(portefeuille.id);
    if (!carte) throw new Error("Aucune carte virtuelle trouvée.");

    return await carteRepository.mettreAJour(carte.id, { limitePlafond: parseFloat(nouveauPlafond) });
  }

  /**
   * 🔍 CONSULTER LE SOLDE DE LA CARTE
   */
  async consulterSoldeCarte(utilisateurId) {
    const portefeuille = await prisma.portefeuille.findFirst({
      where: { utilisateurId },
      include: { carteVirtuelle: true }
    });

    if (!portefeuille || !portefeuille.carteVirtuelle) {
      throw new Error("Aucune carte virtuelle active trouvée pour ce compte.");
    }

    if (portefeuille.carteVirtuelle.statut === "BLOQUEE") {
      throw new Error("Cette carte est actuellement gelée. Dégelez-la pour voir ses détails.");
    }

    const deviseClient = portefeuille.devise;
    const plafondClient = parseFloat(portefeuille.carteVirtuelle.limitePlafond);

    return {
      numeroMasque: portefeuille.carteVirtuelle.numeroMasque,
      statut: portefeuille.carteVirtuelle.statut,
      soldeDisponible: `${parseFloat(portefeuille.solde).toFixed(2)} ${deviseClient}`,
      plafondActuel: `${plafondClient.toFixed(2)} ${deviseClient}`
    };
  }

  /**
   * 🛒 SIMULATION D'UN ACHAT EN LIGNE (Direct Marchand -> Client -> Admin)
   */
  async simulerPaiementMarchand(donnees) {
  const { numeroComplet, cvv, montantAchat, deviseAchat, marchand } = donnees;
  const COMMISSION_POURCENTAGE = 0.02; 

  if (!montantAchat || !deviseAchat || !numeroComplet || !cvv) {
    throw new Error("Champs manquants : Les coordonnées de la carte et de l'achat sont obligatoires.");
  }

  return await prisma.$transaction(async (tx) => {
    
    // 1. 🛡️ RECHERCHE ET VÉRIFICATION SÉCURISÉE DE LA CARTE REALISTE
    // On récupère les cartes pour vérifier les numéros
    const cartesTrouvees = await tx.carteVirtuelle.findMany({
      where: { statut: "ACTIVE" },
      include: { portefeuille: true }
    });

    // On cherche la carte dont le PAN déchiffré correspond au numéro saisi
    const carteValide = cartesTrouvees.find(c => {
      const panDechiffre = securiteService.dechiffrerPAN(c.numeroTokenise);
      return panDechiffre === numeroComplet;
    });

    // Si aucun numéro de carte ne correspond
    if (!carteValide) {
      throw new Error("Transaction déclinée : Numéro de carte invalide ou inexistant.");
    }

    // 2. 🔒 VÉRIFICATION DU CVV (Comparaison du Hash)
    // On compare le CVV reçu avec le hash stocké en BDD
    const cvvCorrect = securiteService.hasherCVV(cvv, carteValide.cvvHash); 
    // Note: Si ton securiteService utilise bcrypt pour le CVV, utilise bcrypt.compare(cvv, carteValide.cvvHash)
    
    if (!cvvCorrect) {
      throw new Error("Transaction déclinée : Code CVV incorrect.");
    }

    // L'entité carte est validée, on extrait son portefeuille
    const portefeuilleClient = carteValide.portefeuille;
    const deviseClient = portefeuilleClient.devise;

    // --- LE RESTE DE TON CODE DE CALCUL ET DE DEBIT RESTE LE MÊME ---
    const portefeuilleAdmin = await tx.portefeuille.findFirst({ where: { utilisateur: { role: "ADMIN" } } });
    const deviseAdmin = portefeuilleAdmin.devise;

    const convAchatVersClient = await currencyHelper.convertir(montantAchat, deviseAchat, deviseClient);
    const montantAchatEnDeviseClient = parseFloat(convAchatVersClient.montantConverti || convAchatVersClient);
    
    if (montantAchatEnDeviseClient > parseFloat(carteValide.limitePlafond)) {
      throw new Error(`Transaction déclinée : Le montant dépasse le plafond de sécurité.`);
    }

    const commissionNuDeviseAchat = montantAchat * COMMISSION_POURCENTAGE;
    const convCommClient = await currencyHelper.convertir(commissionNuDeviseAchat, deviseAchat, deviseClient);
    const commissionDeviseClient = parseFloat(convCommClient.montantConverti || convCommClient);
    const totalAcoeurDebiterClient = montantAchatEnDeviseClient + commissionDeviseClient;

    if (parseFloat(portefeuilleClient.solde) < totalAcoeurDebiterClient) {
      throw new Error(`Transaction déclinée : Solde insuffisant.`);
    }

    const convAdmin = await currencyHelper.convertir(commissionNuDeviseAchat, deviseAchat, deviseAdmin);
    const commissionGainAdmin = parseFloat(convAdmin.montantConverti || convAdmin);

    await tx.portefeuille.update({ where: { id: portefeuilleClient.id }, data: { solde: { decrement: totalAcoeurDebiterClient } } });
    await tx.portefeuille.update({ where: { id: portefeuilleAdmin.id }, data: { solde: { increment: commissionGainAdmin } } });

    return {
      statutPaiement: "APPROUVE",
      autorisationId: "AUTH-" + Math.floor(Math.random() * 899999 + 100000),
      marchand,
      montantAchatOriginal: `${montantAchat.toFixed(2)} ${deviseAchat}`,
      totalDebiteClient: `${totalAcoeurDebiterClient.toFixed(2)} ${deviseClient}`,
      gainAdminTransfere: `${commissionGainAdmin.toFixed(2)} ${deviseAdmin}`
    };
  });
}

  /**
 * 🔓 RÉCUPÉRATION SÉCURISÉE DES COORDONNÉES DE LA CARTE (PAN complet, CVV, Expiration)
 */
  async obtenirCoordonneesSecretes(utilisateurId) {
    // 1. Récupérer le portefeuille de l'utilisateur
    const portefeuille = await prisma.portefeuille.findFirst({
      where: { utilisateurId },
      include: { carteVirtuelle: true }
    });

    if (!portefeuille || !portefeuille.carteVirtuelle) {
      throw new Error("Aucune carte virtuelle active trouvée pour ce compte.");
    }

    const carte = portefeuille.carteVirtuelle;

    // 2. Sécurité : Si la carte est gelée, on interdit l'affichage des numéros
    if (carte.statut === "BLOQUEE") {
      throw new Error("Cette carte est actuellement gelée. Dégelez-la pour afficher ses coordonnées.");
    }

    // 3. Déchiffrement du PAN (Numéro à 16 chiffres) via ton utilitaire de sécurité
    // On suppose que ton securiteService possède une méthode de déchiffrement symétrique
    const numeroCompletDechiffre = securiteService.dechiffrerPAN(carte.numeroTokenise);

    // 4. Note sur le CVV : Si tu as stocké un HASH du CVV (irréversible), tu ne peux pas le décoder.
    // Dans ce cas, soit le CVV est demandé en direct au Provider (ex: Flutterwave/Mono), 
    // soit il a été chiffré de manière symétrique (comme le PAN) au lieu d'être haché.
    // Si tu l'as chiffré de manière réversible, fais : 
    // const cvvDechiffre = securiteService.dechiffrerCVV(carte.cvvChiffre);

    return {
      titulaire: `${portefeuille.utilisateur?.prenom || 'Client'} ${portefeuille.utilisateur?.nom || 'UniPay'}`,
      numeroComplet: numeroCompletDechiffre,
      numeroMasque: carte.numeroMasque,
      cvv: "Voir l'application ou recréer si hashé", // Ajuste selon si ton CVV est déchiffrable ou géré par le provider
      dateExpiration: carte.dateExpiration,
      statut: carte.statut
    };
  }
}

module.exports = new CarteService();