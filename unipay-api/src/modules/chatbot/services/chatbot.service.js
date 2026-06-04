const prisma = require('../../../database/prisma');
const currencyHelper = require('../../../helpers/currency.helper');
// 🔧 REFACTORING: Import du ConversionService centralisé (anciennement de transaction, now in tauxChange)
const conversionService = require('../../tauxChange/services/conversion.service');
const lienPaiementService = require('../../lienPaiement/services/lien.service');
const transfertLinkRepository = require('../../lienPaiement/repositories/lien.repository');
// Imports ajoutés pour l'épargne et les cartes virtuelles
const epargneService = require('../../epargne/services/epargne.service');
const epargneRepository = require('../../epargne/repositories/epargne.repository');
const carteService = require('../../carteVirtuelle/services/carte.service');
// const carteVirtuelleService = require('../../carte/services/carte.service');

class ChatbotService {
  async traiterMessage(utilisateurId, message) {
    const texte = message.trim().toLowerCase();

    // 1. Chargement du contexte de l'utilisateur (Payeur / Investisseur)
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      include: { portefeuille: true }
    });

    if (!utilisateur || !utilisateur.portefeuille) {
      return "❌ *Erreur de synchronisation UniPay* : Impossible de charger votre profil ou votre portefeuille de paiement actif.";
    }

    const prenom = utilisateur.prenom || "Cher membre";
    const nomCompletUser = `${utilisateur.nom || ''} ${utilisateur.prenom || ''}`.toUpperCase().trim();
    const deviseUtilisateur = utilisateur.portefeuille.devise;

    // 🔍 REGEX CRITIQUE POUR L'EXTRACTION DES MONTANTS
    const regexMontant = /(\d+(?:\.\d+)?)/;
    const montantMatch = texte.match(regexMontant);

    // =========================================================================
    // 🔐 INTENTION A : VALIDATION ET EXÉCUTION DU PAIEMENT SECURISE
    // =========================================================================
    // Exemple : "oui je valide le paiement up_lnk_xyz123 pour 5000"
    if (texte.startsWith('oui') && (texte.includes('valide') || texte.includes('j\'accepte le paiement up_lnk_') || texte.includes('confirme') || texte.includes('approuve'))) {
      // 1. Extraction du code unique et du montant via Regex
      const regexCode = /up_lnk_([a-z0-9]+)/i;
      const regexMontant = /de\s+(\d+(?:\.\d+)?)/i; // Capte le montant à la fin

      const matchCode = message.match(regexCode);
      const matchMontant = message.match(regexMontant);

      if (!matchCode || !matchMontant) {
        return "❌ *Format de confirmation incorrect*.\n👉 Exemple attendu : _\"Oui, je valide le paiement up_lnk_75c543fd80 de 2000\"_";
      }

      const codeUnique = matchCode[1]; // Ex: "75c543fd80"
      const montant = matchMontant[1];     // Ex: "2000"

      try {
        // 2. Récupération du lien en BDD pour obtenir la signature HMAC d'origine
        // Le chatbot a besoin de la signature pour prouver l'intégrité au service
        const lienExistant = await transfertLinkRepository.trouverLienValide(codeUnique);

        if (!lienExistant) {
          return "❌ *Erreur de validation* : Ce lien de paiement n'est plus actif ou a expiré.";
        }

        // 3. Appel de ton service avec l'objet correctement structuré !
        const resultatFinancier = await lienPaiementService.executerPaiementLienSecurise(
          utilisateur.id, // ID du payeur (issu du middleware auth)
          {
            codeUnique: codeUnique,
            signature: lienExistant.signatureHmac, // On passe la signature stockée
            montant: montant
          }
        );

        // 4. Succès total ! Construction du reçu WhatsApp
        const historique = resultatFinancier.historiqueTransparent;
        return `✅ *TRANSACTION EFFECTUÉE AVEC SUCCÈS !*\n\n` +
          `💸 *Statut :* ${resultatFinancier.confirmationPayeur}\n` +
          `📥 *Notification bénéficiaire :* ${resultatFinancier.notificationBeneficiaire}\n\n` +
          `🧾 *Détails de la brique de facturation :*\n` +
          `• *Débité :* ${historique.recuExactement} ${historique.deviseSource}\n` +
          `• *Frais appliqués :* ${historique.fraisAppliques}\n` +
          `• *Crédité Net :* ${historique.montantRevientNet.toFixed(2)} ${historique.deviseCible}\n\n` +
          `🆔 *ID Transaction :* \`${resultatFinancier.transactionId}\`\n` +
          `🔒 _Propulsé de bout en bout par le cœur financier UniPay._`;

      } catch (error) {
        return `❌ *Échec critique du paiement* : ${error.message}`;
      }
    }

    // =========================================================================
    // 🔍 INTENTION B : COPIER/COLLER D'UN LIEN - ANALYSE ET SÉCURITÉ ANTI-FRAUDE
    // =========================================================================
    if (texte.includes('http://') || texte.includes('https://') || texte.includes('unipay')) {

      const regexUrl = /(https?:\/\/[^\s]+)/g;
      const urlMatch = texte.match(regexUrl);

      if (urlMatch) {
        const urlComplete = urlMatch[0];

        try {
          const urlObj = new URL(urlComplete);

          // 1. Extraction du 'code' situé dans le chemin de l'URL (/pay/36FF215E88)
          const pathParts = urlObj.pathname.split('/');
          const codeUnique = pathParts[pathParts.length - 1]; // Récupère "36FF215E88"

          // 2. Extraction de la signature 'sig' dans les query params
          const signatureFournie = urlObj.searchParams.get('sig');

          if (!codeUnique || !signatureFournie) {
            return "❌ *Erreur de décodage* : Le lien fourni ne possède pas un format sécurisé UniPay valide.";
          }

          // 3. Appel de la VRAIE méthode de ton TransferLinkService
          const lienData = await lienPaiementService.inspecterLienEtVerifierSignature(codeUnique, signatureFournie);

          // 4. Sécurité Anti-Fraude : On compare l'ID du demandeur avec l'utilisateur du bot
          if (lienData.demandeur.id === utilisateur.id) {
            return "⚠️ *Opération Interdite* : Vous essayez de régler un lien de paiement que vous avez vous-même généré.";
          }

          // Extraction optionnelle d'un montant saisi par l'utilisateur dans le message WhatsApp
          const montantMatch = texte.match(/\b\d+\b/);
          let montantFinal = lienData.montant ? parseFloat(lienData.montant) : (montantMatch ? parseFloat(montantMatch[0]) : 0);

          if (!montantFinal) {
            return `🔓 *UniPay — Lien Libre* : Ce lien de paiement n'a pas de montant fixe.\n` +
              `👉 *Veuillez spécifier le montant à envoyer dans votre message.*\n` +
              `_Exemple : "Envoie 5000 au lien ${urlComplete}"_`;
          }

          const nomCompletBeneficiaire = `${lienData.demandeur.nom || ''} ${lienData.demandeur.prenom || ''}`.toUpperCase().trim();

          // 5. On renvoie la carte d'identité validée et la phrase clé pour l'Étape A
          // On utilise le 'codeUnique' pour la phrase de validation finale
          return `🛡️ *UniPay — Protocole Anti-Fraude & Escroquerie*\n\n` +
            `Le protocole cryptographique a validé la brique externe :\n\n` +
            `👤 *IDENTITÉ DU DESTINATAIRE :* *${nomCompletBeneficiaire}*\n` +
            `🌍 *PAYS / DEVISE DU COMPTE :* ${lienData.demandeur.pays} (${lienData.demandeur.devise})\n` +
            `💰 *MONTANT REQUIS :* *${montantFinal.toLocaleString()} ${lienData.demandeur.devise}*\n\n` +
            `❗ *VÉRIFICATION COMPLIANCE :* Confirmez-vous l'identité de ce bénéficiaire ?\n\n` +
            `👉 *Pour valider et exécuter le virement instantané*, répondez exactement :\n` +
            `_"Oui, je valide le paiement up_lnk_${codeUnique} de ${montantFinal}"_`;

        } catch (error) {
          // Attrape les throw Error() de ton service ("Lien invalide", "Lien altéré", etc.)
          return `❌ *UniPay Securité* : ${error.message}`;
        }
      }
    }

    // =========================================================================
    // 📈 INTENTION C : ASSISTANT ÉPARGNE ET SIMULATION OBJECTIFS
    // =========================================================================

    // 1. SCÉNARIO : Demande d'explications sur le fonctionnement ou la fructification
    if (texte.includes('comment fonctionne l\'epargne') ||
      texte.includes('fructifie') ||
      texte.includes('benefice') ||
      texte.includes('bénéfice') ||
      texte.includes('explique moi l\'epargne')) {

      return `🌱 *UniPay Vault — Politique de Transparence Intégrale*\n\n` +
        `Chez UniPay, nous ne faisons *aucune promesse de rentabilité factice*. Votre argent **ne se fructifie pas** et ne génère aucun bénéfice spéculatif. \n\n` +
        `🎯 *À quoi ça sert alors ?*\n` +
        `Le système est conçu exclusivement comme un outil de **discipline financière** pour vous aider à mettre de l'argent de côté régulièrement afin d'atteindre un objectif précis (Moto, Ordinateur, Études, Voyage) sans toucher à votre solde quotidien.\n\n` +
        `🛡️ *Nos deux sous-types d'Épargne :*\n` +
        `• 🔓 *Épargne Légère :* Vos fonds sont isolés pour votre projet, mais restent retirables vers votre solde principal à tout moment.\n` +
        `• 🔒 *Épargne Stricte :* Pour les vrais disciplinés. L'argent est totalement verrouillé dans le coffre et vous ne pourrez le retirer **que lorsque l'objectif sera atteint à 100%**.\n\n` +
        `🤖 *Épargne Simple vs Intelligente :*\n` +
        `• *Simple :* Vous alimentez votre coffre vous-même, à votre rythme.\n` +
        `• *Intelligente :* Notre système analyse vos entrées d'argent et vous propose un montant indolore à mettre de côté automatiquement par période. Vous gardez le contrôle grâce à un bouton d'activation (Toggle).`;
    }

    // 2. SCÉNARIO : Simulateur de crédit / calcul de temps
    if (texte.includes('combien je peux') || texte.includes('atteindre le montant') || texte.includes('epargner pour')) {

      const chiffres = texte.match(/\b\d+\b/g);

      if (!chiffres || chiffres.length < 2) {
        return `💡 *UniPay Simulateur Objectif*\n\n` +
          `Pour simuler un plan d'épargne, posez-moi la question avec un montant et une durée.\n` +
          `👉 *Exemple :* _"Combien je peux mettre de côté pour atteindre le montant 400000 en 8 mois ?"_`;
      }

      const nombres = chiffres.map(Number);
      const montantCible = Math.max(...nombres);
      const dureeMois = Math.min(...nombres);

      // 💡 DYNAMIQUE : Détection de la devise depuis le portefeuille ou via le numéro de téléphone (currencyHelper)
      let geoProfil = currencyHelper.detecterParTelephone(utilisateur.telephone);
      const deviseUtilisateur = utilisateur.portefeuille?.devise || utilisateur.portefeuille?.currency || geoProfil.devise;

      const mensualite = Math.ceil(montantCible / dureeMois);
      const hebdomadaire = Math.ceil(mensualite / 4);
      const journalier = montantCible / (dureeMois * 30);

      return `📊 *UniPay Intelligent — Simulation de Plan d'Épargne*\n\n` +
        `Pour atteindre votre objectif de *${montantCible.toLocaleString()} ${deviseUtilisateur}* en *${dureeMois} mois*, voici les options adaptées que le système peut automatiser :\n\n` +
        `📅 *Option Mensuelle :* Mettre de côté *${mensualite.toLocaleString()} ${deviseUtilisateur}* / mois.\n` +
        `📆 *Option Hebdomadaire :* Mettre de côté *${hebdomadaire.toLocaleString()} ${deviseUtilisateur}* / semaine.\n` +
        `⏰ *Option Journalière :* Mettre de côté *${journalier.toFixed(2).toLocaleString()} ${deviseUtilisateur}* / jour.\n\n` +
        `----------------------------------------\n` +
        `💡 *Suggestion IA UniPay :* ` +
        (
          journalier <= 1000
            ? `Votre objectif semble facilement atteignable avec une petite épargne quotidienne automatisée.`
            : hebdomadaire <= 10000
              ? `Une planification hebdomadaire pourrait être plus confortable pour votre trésorerie.`
              : `Une planification mensuelle est recommandée pour mieux équilibrer vos dépenses.`
        ) +
        `\n\n⚠️ *Rappel Compliance :* Ce placement ne génère aucun intérêt ou bénéfice. Il s'agit d'une mise de côté stricte pour sécuriser votre projet.\n\n` +
        `👉 *Souhaitez-vous que je crée cet objectif en Épargne Stricte ?*\n` +
        `Répondez : _"Créer objectif [Nom du projet] de ${montantCible} pour ${dureeMois} mois"_`;

    }

    // 3. SCÉNARIO : Demande de retrait initiale
    if (texte.startsWith('retirer epargne') || texte.includes('casser mon objectif') || texte.includes('recuperer mon argent')) {

      const objectifs = await epargneRepository.listerObjectifsActifs(utilisateur.portefeuille.id);

      if (objectifs.length === 0) {
        return "❌ *UniPay Vault* : Vous n'avez aucun objectif d'épargne actif à liquider.";
      }

      const obj = objectifs[0];

      // 💡 DYNAMIQUE : Aucun fallback en dur
      let geoProfil = currencyHelper.detecterParTelephone(utilisateur.telephone);
      const devise = utilisateur.portefeuille?.devise || utilisateur.portefeuille?.currency || geoProfil.devise;

      if (obj.sousType === "STRICTE" && obj.montantActuel < obj.montantCible) {
        const microFrais = obj.montantActuel * 0.0005;

        return `⚠️ *UniPay Protocole Discipline — Objectif Incomplet*\n\n` +
          `Vous demandez à récupérer l'argent de votre objectif : *${obj.nom.toUpperCase()}*.\n` +
          `🔒 Ce coffre est configuré en mode *ÉPARGNE STRICTE*.\n\n` +
          `• Montant accumulé actuel : *${obj.montantActuel.toLocaleString()} ${devise}* / *${obj.montantCible.toLocaleString()} ${devise}*\n` +
          `• Pénalité de rupture anticipée (0.05%) : *-${microFrais.toLocaleString()} ${devise}*\n\n` +
          `❗ *L'infrastructure prélèvera ces frais si vous cassez le coffre maintenant.*\n\n` +
          `👉 Pour confirmer et accepter les frais, répondez exactement :\n` +
          `_"Oui, je brise mon epargne stricte id ${obj.id.substring(0, 8)}"_`;
      }

      return `🔓 *UniPay Vault — Retrait Disponible*\n\n` +
        `Votre objectif *${obj.nom}* est prêt à être transféré vers votre solde disponible.\n` +
        `• Montant reversé : *${obj.montantActuel.toLocaleString()} ${devise}*\n` +
        `• Frais appliqués : 0 ${devise}.\n\n` +
        `👉 Répondez *\"Valider retrait coffre\"* pour exécuter le virement instantané.`;
    }

    // 4. SYNCHRONISATION : Confirmer rupture STRICTE
    if (texte.startsWith('oui, je brise mon epargne stricte id')) {
      const segmentId = texte.split('id ')[1]?.trim();

      const objectifs = await epargneRepository.listerObjectifsActifs(utilisateur.portefeuille.id);
      const obj = objectifs.find(o => o.id.substring(0, 8) === segmentId);

      if (!obj) return "❌ *UniPay Vault* : Identifiant de coffre introuvable ou déjà clôturé.";

      try {
        const execution = await epargneService.liquiderObjectif(utilisateur.id, obj.id, true);

        return `💥 *Rupture Anticipée Validée*\n\n` +
          `Votre coffre *${obj.nom.toUpperCase()}* a été brisé.\n` +
          `• Pénalité de discipline (0.05%) : *-${execution.penalitePrelevee.toLocaleString()} ${execution.devise}* (transférée au fonds d'infrastructure).\n` +
          `• Montant reversé sur votre solde : *${execution.montantRestitue.toLocaleString()} ${execution.devise}*.\n\n` +
          `📉 Votre discipline financière a pris un coup, mais votre argent est disponible.`;
      } catch (error) {
        return `❌ Erreur lors de l'opération : ${error.message}`;
      }
    }

    // 5. SYNCHRONISATION : Confirmer retrait Flexible/Complet
    if (texte === 'valider retrait coffre') {
      const objectifs = await epargneRepository.listerObjectifsActifs(utilisateur.portefeuille.id);
      if (objectifs.length === 0) return "❌ Aucun objectif actif à liquider.";

      const obj = objectifs[0];

      try {
        const execution = await epargneService.liquiderObjectif(utilisateur.id, obj.id, false);

        return `🎉 *Félicitations — Objectif Clôturé !*\n\n` +
          `L'argent de votre coffre *${obj.nom}* a été transféré avec succès vers votre solde principal.\n` +
          `• Montant crédité : *${execution.montantRestitue.toLocaleString()} ${execution.devise}*\n` +
          `• Frais appliqués : 0 ${execution.devise}.\n\n` +
          `Merci de faire confiance à UniPay pour vos projets !`;
      } catch (error) {
        return `❌ Impossible de liquider le coffre : ${error.message}`;
      }
    }
    // =========================================================================
    // 💳 INTENTION D : CARTE VIRTUELLE INTERNATIONALE (VISA / MASTERCARD)
    // =========================================================================
    if (texte.includes('carte') || texte.includes('virtuelle') || texte.includes('visa') || texte.includes('mastercard') || texte.includes('geler') || texte.includes('bloquer') || texte.includes('plafond')) {

      const FRAIS_BASE_CREATION = 1000.00;

      // 🆕 CAS 1 : DEMANDE DE CRÉATION / ÉMISSION
      if (texte.includes('procurer') || texte.includes('créer') || texte.includes('creer') || texte.includes('acheter')) {
        const reseauSelectionne = texte.includes('mastercard') ? 'MASTERCARD' : 'VISA';

        try {
          // Appel direct à ton service métier (déduit 1000 de frais et crée la carte)
          const executionCommande = await carteService.commanderCarteUnique(utilisateur.id);

          return `💳 *UniPay Cards — Émission Réussie !*\n\n` +
            `Votre carte internationale dématérialisée unique a été activée et rattachée à votre identité bancaire.\n\n` +
            `• *Réseau partenaire :* ${reseauSelectionne}\n` +
            `• *Titulaire :* ${nomCompletUser}\n` +
            `• *Frais d'activation appliqués :* ${executionCommande.fraisClient}\n\n` +
            `🔒 *COORDONNÉES BANCAIRES SÉCURISÉES :*\n` +
            `• *Numéro :* ${executionCommande.numeroMasque} (Masqué pour votre sécurité)\n` +
            `• *Expiration & CVV :* Disponibles en toute sécurité sur votre application.\n\n` +
            `💡 _Votre carte pioche directement dans le solde de votre portefeuille UniPay. Vous pouvez l'utiliser dès maintenant pour vos campagnes publicitaires (Facebook, Google Ads) ou vos abonnements internationaux._`;

        } catch (error) {
          // Gestion propre de la règle "Carte Unique" ou "Solde Insuffisant"
          if (error.message.includes("déjà une carte")) {
            return `⚠️ *Opération refusée* : Vous possédez déjà une carte virtuelle UniPay active. Conformément à nos règles de sécurité, nous n'autorisons qu'une seule carte unique par compte utilisateur.`;
          }
          return `❌ *Échec de la demande d'émission* : ${error.message}`;
        }
      }

      // ❄️ CAS 2 : GELER OU DÉGELER LA CARTE
      if (texte.includes('geler') || texte.includes('bloquer') || texte.includes('dégeler') || texte.includes('degel') || texte.includes('activer')) {
        const action = (texte.includes('geler') || texte.includes('bloquer')) ? 'GELER' : 'DEGELER';

        try {
          await carteService.modifierStatutCarte(utilisateur.id, action);

          if (action === 'GELER') {
            return `❄️ *Sécurité UniPay — Carte Gelée*\n\n` +
              `Votre carte virtuelle a été mise en pause immédiatement. Toutes les tentatives d'achats en ligne sur cette carte seront désormais rejetées.\n\n` +
              `👉 Pour la réactiver à tout moment, écrivez simplement : _"Dégeler ma carte"_`;
          } else {
            return `🔥 *Sécurité UniPay — Carte Réactivée*\n\n` +
              `Votre carte virtuelle unique est à nouveau opérationnelle et prête pour vos transactions en ligne.\n\n` +
              `🛒 Vous pouvez reprendre vos paiements publicitaires et vos achats internationaux en toute fluidité.`;
          }
        } catch (error) {
          return `❌ *Erreur de modification de statut* : ${error.message}`;
        }
      }

      // 🎛️ CAS 3 : MODIFIER LE PLAFOND DE SÉCURITÉ
      if (texte.includes('plafond') && (texte.includes('modifier') || texte.includes('changer') || texte.includes('augmenter') || texte.includes('baisser'))) {
        const montantPlafondMatch = texte.match(/\d+[\d\s]*/); // Capture le nombre dans la phrase
        const nouveauPlafond = montantPlafondMatch ? parseFloat(montantPlafondMatch[0].replace(/\s/g, '')) : 0;

        if (!nouveauPlafond || nouveauPlafond <= 0) {
          return `⚠️ *Format incorrect* : Pour modifier votre plafond de dépenses de sécurité, veuillez préciser un montant valide.\n\n` +
            `👉 *Exemple :* _"Modifier le plafond de ma carte à 50000"_.`;
        }

        try {
          const carteMiseAJour = await carteService.modifierPlafond(utilisateur.id, nouveauPlafond);
          return `🎛️ *Configuration de Sécurité — Plafond Mis à Jour*\n\n` +
            `Le plafond maximal de dépenses autorisé sur votre carte virtuelle a été reconfiguré.\n\n` +
            `• *Nouveau Plafond :* *${carteMiseAJour.limitePlafond.toLocaleString()} ${deviseUtilisateur}*\n\n` +
            `🛡️ _Cette limite fait écran de sécurité : aucun commerçant en ligne ne pourra vous débiter au-delà de ce montant, même si votre solde principal est plus élevé._`;
        } catch (error) {
          return `❌ *Erreur de modification du plafond* : ${error.message}`;
        }
      }

      // 🔍 CAS 4 : CONSULTATION DU SOLDE ET DETAILS DE LA CARTE
      if (texte.includes('solde') || texte.includes('info') || texte.includes('détail') || texte.includes('voir')) {
        try {
          const infosCarte = await carteService.consulterSoldeCarte(utilisateur.id);

          return `🔍 *État de votre Carte Virtuelle UniPay*\n\n` +
            `• *Numéro Masqué :* ${infosCarte.numeroMasque}\n` +
            `• *Statut :* ${infosCarte.statut === 'ACTIVE' ? '✅ Opérationnelle' : '❄️ Gelée / Bloquée'}\n` +
            `• *Solde disponible :* *${infosCarte.soldeDisponible}*\n` +
            `• *Plafond de sécurité actuel :* *${infosCarte.plafondActuel}*\n\n` +
            `💡 _Rappel : Votre carte consomme en temps réel le solde de votre portefeuille principal UniPay, dans la limite de votre plafond configuré._`;
        } catch (error) {
          return `⚠️ *Consultation impossible* : ${error.message}\n` +
            `👉 Si vous n'avez pas encore de carte, demandez : _"Créer une carte Visa"_ pour en obtenir une pour seulement *${FRAIS_BASE_CREATION} ${deviseUtilisateur}*.`;
        }
      }

      // 📜 CAS 5 : DOCUMENTATION EXHAUSTIVE ET GUIDE COMPLET DES CARTES
      return `💳 *GUIDE COMPLET — CARTES VIRTUELLES INTERNATIONALES UNIPAY*\n\n` +
        `L'assistant conversationnel UniPay vous permet de commander, configurer et sécuriser votre carte internationale Visa ou MasterCard par simple message.\n\n` +

        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🌟 1. QU'EST-CE QUE LA CARTE VIRTUELLE UNIPAY ?\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `C'est une carte bancaire internationale 100% numérique (dématérialisée), sans support plastique. Elle est émise instantanément par nos partenaires bancaires globaux (BIN Sponsors) et sécurisée par un chiffrement de niveau militaire.\n\n` +
        `• *Zéro Risque Physique :* Impossible de la perdre ou de se la faire voler dans la rue.\n` +
        `• *Compatibilité Globale :* Elle fonctionne partout dans le monde sur les réseaux Visa et MasterCard.\n` +
        `• *Cas d'usages phares :* Idéale pour vos abonnements (Netflix, Spotify, Prime Video), vos achats e-commerce (Amazon, AliExpress, Shein) et surtout pour les professionnels du digital (campagnes publicitaires Meta Ads, Google Ads, TikTok Ads).\n\n` +

        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🧠 2. SYNC & ARCHITECTURE : LE PORTAGE SUR LE PORTEFEUILLE\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Contrairement aux cartes bancaires traditionnelles lourdes, UniPay utilise une architecture fluide et interconnectée :\n\n` +
        `• *Pas de double rechargement :* Votre carte virtuelle n'a pas un solde isolé. Elle est directement indexée sur le solde de votre portefeuille principal UniPay.\n` +
        `• *Débit en Temps Réel :* Lorsque vous effectuez un achat en ligne, le commerçant interroge le commutateur UniPay. Si votre portefeuille est provisionné, le montant est débité instantanément.\n` +
        `• *Plafond Écran de Protection :* Vous définissez vous-même une limite maximale de dépenses (un plafond). Même si votre portefeuille contient 500 000 XAF, si votre plafond de carte est fixé à 50 000 XAF, aucun site marchand ne pourra vous prélever plus de 50 000 XAF. C'est la protection anti-piratage absolue.\n\n` +

        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🚀 3. LES ÉTAPES D'OBTENTION (ÉMISSION INSTANTANÉE)\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Pour obtenir votre carte unique en moins de 30 secondes, la procédure est entièrement automatisée :\n\n` +
        `1️⃣ *Vérification du Solde :* Assurez-vous de disposer d'au moins *${FRAIS_BASE_CREATION.toLocaleString()} ${deviseUtilisateur}* sur votre compte UniPay (frais de création uniques et définitifs, aucun abonnement mensuel caché).\n` +
        `2️⃣ *Émission & Signature :* Notre système envoie une requête cryptée à notre fournisseur bancaire pour générer vos numéros uniques (PAN à 16 chiffres, date d'expiration et code CVV).\n` +
        `3️⃣ *Sécurisation locale :* UniPay applique un algorithme de hachage sur votre CVV et chiffre votre numéro de carte en base de données avant de rattacher la carte à votre identité.\n` +
        `4️⃣ *Mise à disposition :* Votre carte est immédiatement active et prête à l'emploi.\n\n` +

        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🛠️ 4. COMMENT PILOTER VOTRE CARTE PAR MESSAGE ?\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Vous pouvez envoyer ces ordres exacts au chatbot :\n\n` +
        `• 🆕 *Pour commander :* _"Créer une carte Visa"_ ou _"Acheter une carte MasterCard"_.\n` +
        `• 🔍 *Pour auditer la carte :* _"Voir le solde de ma carte"_ ou _"Infos carte"_ (Affiche le statut, le numéro masqué et le plafond actuel).\n` +
        `• ❄️ *Pour stopper un piratage :* _"Geler ma carte"_ ou _"Bloquer ma carte"_. Le statut passe instantanément à BLOQUÉE (Gratuit).\n` +
        `• 🔥 *Pour la réactiver :* _"Dégeler ma carte"_ ou _"Activer ma carte"_.\n` +
        `• 🎛️ *Pour modifier la sécurité :* _"Modifier le plafond à 75000"_ (Ajuste instantanément votre bouclier de dépenses).\n\n` +
        `👉 _Par quoi souhaitez-vous commencer ? Écrivez par exemple : "Créer une carte Visa"_`;
    }

    // =========================================================================
    // 💱 INTENTION E : SIMULATION DE CHANGE INTERNATIONALE (STRICTE)
    // =========================================================================
    if (texte.includes('envoie') || texte.includes('recevoir') || texte.includes('convert') || texte.includes('change') || texte.includes('combien')) {
      if (montantMatch) {
        const montant = parseFloat(montantMatch[0]);
        const devisesSupportees = currencyHelper.getDevisesSupportees().map(d => d.toLowerCase());
        const mots = texte.split(/[\s,',".?]+/);

        const devisesIdentifiees = [];
        for (const mot of mots) {
          if (devisesSupportees.includes(mot)) {
            devisesIdentifiees.push(mot.toUpperCase());
          } else {
            const deviseViaPays = currencyHelper.extraireDeviseParNomPays(mot);
            if (deviseViaPays) devisesIdentifiees.push(deviseViaPays.toUpperCase());
          }
        }

        const devisesAxe = [...new Set(devisesIdentifiees)];

        if (devisesAxe.length < 2) {
          return `💱 *UniPay — Précision de Couloir Requise* \n\n` +
            `Bonjour ${prenom}, pour dresser une simulation exacte sans taux arbitraires, j'ai impérativement besoin du *pays/devise de départ* et de *destination*.\n\n` +
            `💡 *Formulez ainsi :*\n` +
            `• _"Si du *Cameroun* j'envoie ${montant} en *France*, il reçoit combien ?"_\n` +
            `• _"Convertir ${montant} *USD* en *XAF*"_`;
        }

        const deviseSource = devisesAxe[0];
        const deviseCible = devisesAxe[1];

        try {
          const taux = currencyHelper.obtenirTauxStatique(deviseSource, deviseCible);
          const frais = currencyHelper.calculerFraisSimules(montant, deviseSource);

          const montantAConvertir = montant - frais;
          const montantFinal = parseFloat((montantAConvertir * taux).toFixed(2));

          return `🌍 *UniPay — Moteur de Conversion International*\n\n` +
            `• *Couloir d'échange :* ${currencyHelper.getNomPaysParDevise(deviseSource)} (${deviseSource}) ➔ ${currencyHelper.getNomPaysParDevise(deviseCible)} (${deviseCible})\n` +
            `• *Montant de départ :* ${montant.toLocaleString()} ${deviseSource}\n\n` +
            `⚙️ *Transparence financière intégrale :*\n` +
            `• *Frais de traitement :* -${frais.toLocaleString()} ${deviseSource} (1.5% d'infrastructure)\n` +
            `• *Taux de change appliqué :* 1 ${deviseSource} = ${taux.toFixed(4)} ${deviseCible}\n\n` +
            `💰 *Le destinataire reçoit précisément :* *${montantFinal.toLocaleString()} ${deviseCible}*\n\n` +
            `_Aucune taxe dissimulée ne sera prélevée lors de la réception._`;
        } catch (error) {
          return `❌ *Simulation avortée* : ${error.message}`;
        }
      }
    }

    // =========================================================================
    // 🛒 INTENTION F : GÉNÉRATION DE NOUVEAUX LIENS UNI PAY
    // =========================================================================
    if (texte.includes('génère') || texte.includes('genere') || texte.includes('crée') || texte.includes('cree') || texte.includes('lien')) {
      const estMarchand = texte.includes('marchand') || texte.includes('strict') || texte.includes('fixe') || texte.includes('vendeur');

      try {
        if (estMarchand && montantMatch) {
          const montantFixe = parseFloat(montantMatch[0]);
          const resultatLien = await lienPaiementService.genererLienSigne(utilisateurId, utilisateur.portefeuille.id, {
            mode: "MARCHAND",
            montantGele: montantFixe,
            devise: deviseUtilisateur
          });

          return `🛍️ *UniPay Business — Lien Marchand Inviolable*\n\n` +
            `Votre brique de vente sécurisée a été générée avec succès :\n\n` +
            `• *Montant Verrouillé :* *${montantFixe.toLocaleString()} ${deviseUtilisateur}*\n` +
            `• *Règle stricte :* L'acheteur ne pourra pas altérer le montant d'un seul centime. Sa seule alternative est de valider le règlement.\n\n` +
            `🔗 *Lien marchand signé :*\n${resultatLien.lienDePartage}`;

        } else {
          const montantSuggere = montantMatch ? parseFloat(montantMatch[0]) : null;
          const resultatLien = await lienPaiementService.genererLienSigne(utilisateurId, utilisateur.portefeuille.id, {
            mode: "SIMPLE",
            montantParDefaut: montantSuggere,
            devise: deviseUtilisateur
          });

          return `🔓 *UniPay — Lien Simple (Facturation Flexible)*\n\n` +
            `Votre lien d'accès libre a été configuré :\n\n` +
            `• *Montant suggéré :* ${montantSuggere ? montantSuggere.toLocaleString() + ' ' + deviseUtilisateur : "Libre (Laissé au choix du payeur)"}\n` +
            `• *Règle :* Ce lien donne le plein contrôle au payeur pour saisir la somme exacte qu'il désire vous transférer.\n\n` +
            `🔗 *Lien libre d'accès :*\n${resultatLien.lienDePartage}`;
        }
      } catch (error) {
        return `❌ *Échec de création de la brique de paiement* : ${error.message}`;
      }
    }

    // =========================================================================
    // 📖 INTENTION G : MENU CENTRALISÉ DE SECOURS (DASHBOARD WHATSAPP)
    // =========================================================================

    // Récupération dynamique de la devise de l'utilisateur pour formater les exemples du menu
    let geoMenu = currencyHelper.detecterParTelephone(utilisateur.telephone);
    const dev = utilisateur.portefeuille?.devise || utilisateur.portefeuille?.currency || geoMenu.devise;

    return `🤖 *UniPay Assistant — Menu Centralisé*\n\n` +
      `Bonjour ${prenom}, je pilote l'ensemble de vos briques de services UniPay directement ici. Voici vos commandes valides :\n\n` +

      `*🛡️ Consommer un Lien Reçu (Sécurité Avancée) :*\n` +
      `• Collez simplement un lien UniPay reçu pour analyser l'identité du bénéficiaire via notre protocole anti-fraude.\n` +
      `👉 _"Envoie 5000 au lien https://unipay-app.com/pay/..."_\n\n` +

      `*🛒 Émettre un Lien de Paiement :*\n` +
      `• Demandez la génération d'un lien de facturation instantané.\n` +
      `👉 _"Générer un lien de paiement de 2500"_\n\n` +

      `*📈 Discipline Financière (Épargne Projet) :*\n` +
      `• Sans aucune promesse de rentabilité factice, mettez de l'argent de côté à votre rythme pour atteindre vos objectifs (Moto, Ordinateur, Voyage...).\n` +
      `👉 _"Explique moi l'épargne"_ (Comprendre les modes Léger et Strict).\n` +
      `👉 _"Combien je peux mettre de côté pour atteindre le montant 400000 en 8 mois ?"_ (Simulateur Intelligent).\n\n` +

      `*💳 Cartes Internationales Virtuelles :*\n` +
      `• Créez des cartes bancaires temporaires ou permanentes pour vos achats en ligne, abonnements et publicités.\n` +
      `👉 _"Créer une carte Visa de 10000 ${dev}"_ (Génération immédiate).\n\n` +

      `*💱 Taux de Change & Cotations Multi-Devises :*\n` +
      `• Interrogez notre brique de conversion en direct.\n` +
      `👉 _"Convertir 100 USD en ${dev}"_`;
  }
}

module.exports = new ChatbotService();