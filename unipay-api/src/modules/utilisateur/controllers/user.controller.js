const bcrypt = require('bcrypt');
const utilisateurService = require('../services/user.service');
const prisma = require('../../../database/prisma'); 
const CurrencyHelper = require('../../../helpers/currency.helper'); 

class UtilisateurController {

  /**
   * GET /api/v1/utilisateurs/admin/devises-pays
   */
  async obtenirDevisesEtPays(req, res, next) {
    try {
      const listePays = Object.entries(CurrencyHelper.cartographiePays).map(([nom, config]) => ({
        nom: nom.charAt(0).toUpperCase() + nom.slice(1), 
        codeISO: config.code,                           
        devise: config.devise                           
      }));
      
      return res.status(200).json({ 
        success: true, 
        data: listePays 
      });
    } catch (error) {
      console.error("❌ Erreur dans obtenirDevisesEtPays :", error);
      next(error);
    }
  }

  /**
   * POST /api/v1/utilisateurs/admin/creer-utilisateur
   */
  async creerUtilisateurParAdmin(req, res, next) {
    try {
      const { nom, prenom, email, telephone, role, pays, motDePasse } = req.body;
      const hashedPassword = await bcrypt.hash(motDePasse, 10);

      const deviseAssociee = CurrencyHelper.getCurrencyByPhoneOrCountry(null, pays) || 'USD';

      // Création de l'utilisateur ET de son portefeuille par défaut (Transaction Prisma)
      const nouvelUtilisateur = await prisma.$transaction(async (tx) => {
        const user = await tx.utilisateur.create({
          data: {
            nom, prenom, email, telephone, role, pays,
            motDePasse: hashedPassword,
            statutKyc: 'NIVEAU_0', // 🛡️ Corrigé : Alignement sur ton ENUM ('NIVEAU_0', 'NIVEAU_1', 'NIVEAU_2')
            estActif: true
          }
        });

        await tx.portefeuille.create({
          data: {
            utilisateurId: user.id,
            solde: 0,
            devise: deviseAssociee, 
            statut: 'ACTIF'
          }
        });
        return user;
      });

      return res.status(201).json({ success: true, data: nouvelUtilisateur });
    } catch (error) { 
      console.error("❌ Erreur dans creerUtilisateurParAdmin :", error);
      next(error); 
    }
  }

  /**
   * PUT /api/v1/utilisateurs/admin/:id/modifier-profil
   */
  async modifierProfilParAdmin(req, res, next) {
    try {
      const { id } = req.params;
      const { nom, prenom, email, telephone, role, pays, motDePasse } = req.body;

      const dataToUpdate = { nom, prenom, email, telephone, role, pays };

      if (motDePasse && motDePasse.trim() !== '') {
        dataToUpdate.motDePasse = await bcrypt.hash(motDePasse, 10);
      }

      const utilisateurMisAJour = await prisma.utilisateur.update({
        where: { id },
        data: dataToUpdate
      });

      return res.status(200).json({ success: true, data: utilisateurMisAJour });
    } catch (error) { 
      console.error("❌ Erreur dans modifierProfilParAdmin :", error);
      next(error); 
    }
  }

 /**
   * GET /api/v1/utilisateurs/admin/liste
   */
  async obtenirTousLesUtilisateurs(req, res, next) {
    try {
      const liste = await prisma.utilisateur.findMany({
        select: {
          id: true,
          nom: true,
          prenom: true,
          email: true,
          telephone: true,
          role: true,
          statutKYC: true, 
          statutCompte: true, // 👈 On récupère le vrai champ
          dateCreation: true,
          portefeuille: { // 👈 Jointure essentielle pour le solde
            select: { id: true, solde: true, devise: true, statut: true }
          }
        },
        orderBy: { dateCreation: 'desc' }
      });

      // 🔄 Formatage à la volée pour que React reçoive la propriété virtuelle "estActif"
      const listeFormatee = liste.map(u => ({
        ...u,
        estActif: u.statutCompte === 'ACTIF'
      }));

      return res.status(200).json({ success: true, data: listeFormatee });
    } catch (error) {
      console.error("❌ Erreur dans obtenirTousLesUtilisateurs :", error);
      next(error);
    }
  }

  /**
   * POST /api/v1/utilisateurs/admin/valider-kyc
   */
  async validerKycClient(req, res, next) {
    try {
      const responsableId = req.user.id; 
      const { utilisateurId, niveauKyc } = req.body;

      const resultat = await utilisateurService.approuverKycUtilisateur(utilisateurId, niveauKyc, responsableId);

      return res.status(200).json({ success: true, data: resultat });
    } catch (error) {
      console.error("❌ Erreur dans validerKycClient :", error);
      next(error);
    }
  }

  /**
   * PATCH /api/v1/utilisateurs/admin/:id/statut
   */
  async changerStatutCompte(req, res, next) {
    try {
      const { id } = req.params;
      const { estActif } = req.body; // Reçoit true ou false depuis le Front-end

      // 🔄 Traduction du booléen Front-end vers ton Enum Prisma réel (statutCompte)
      const nouveauStatut = estActif ? 'ACTIF' : 'SUSPENDU';

      const utilisateurMisAJour = await prisma.utilisateur.update({
        where: { id },
        data: { 
          statutCompte: nouveauStatut // 👈 Utilisation du vrai champ de ton schéma
        },
        select: { 
          id: true, 
          statutCompte: true 
        }
      });

      // Renvoie une réponse structurée pour ne pas faire planter l'état React
      return res.status(200).json({ 
        success: true, 
        data: {
          id: utilisateurMisAJour.id,
          estActif: utilisateurMisAJour.statutCompte === 'ACTIF' // Retraduit en booléen pour React
        } 
      });
    } catch (error) {
      console.error("❌ Erreur dans changerStatutCompte :", error);
      next(error);
    }
  }

  /**
   * GET /api/v1/utilisateurs/me
   */
  async getMonProfil(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const profil = await utilisateurService.obtenirProfilUtilisateur(utilisateurId);

      return res.status(200).json({
        success: true,
        data: profil
      });
    } catch (error) {
      console.error("❌ Erreur dans getMonProfil :", error);
      next(error);
    }
  }

  /**
   * PUT /api/v1/utilisateurs/me
   */
  async updateMonProfil(req, res, next) {
    try {
      const utilisateurId = req.user.id;
      const { nom, prenom, email } = req.body;

      const profilModifie = await utilisateurService.mettreAJourProfil(utilisateurId, { nom, prenom, email });

      return res.status(200).json({
        success: true,
        message: "Votre profil a été mis à jour avec succès.",
        data: profilModifie
      });
    } catch (error) {
      console.error("❌ Erreur dans updateMonProfil :", error);
      next(error);
    }
  }
}

module.exports = new UtilisateurController();