const walletRepository = require('../repositories/wallet.repository');
const AppError = require('../../../utils/app-error');

class WalletService {
  // 1. Consulter le portefeuille
  async recupererParUtilisateur(userId) {
    const wallet = await walletRepository.findByUserId(userId);
    if (!wallet) {
      throw new AppError('Portefeuille introuvable pour cet utilisateur.', 404);
    }
    return wallet;
  }
/*
  // 2. Créditer le compte (Recharge / Réception de fonds)
  async crediterCompte(userId, montant) {
    if (montant <= 0) throw new AppError('Le montant doit être supérieur à 0.', 400);
    
    const wallet = await this.recupererParUtilisateur(userId);
    const nouveauSolde = wallet.solde + montant;

    return await walletRepository.updateBalances(userId, { solde: nouveauSolde });
  }

  // 3. Débiter le compte (Paiement direct / Retrait)
  async debiterCompte(userId, montant) {
    if (montant <= 0) throw new AppError('Le montant doit être supérieur à 0.', 400);

    const wallet = await this.recupererParUtilisateur(userId);

    // 🚨 RÈGLE DE SÉCURITÉ FINANCIÈRE : Vérification de provision
    if (wallet.solde < montant) {
      throw new AppError('Solde insuffisant pour effectuer cette opération.', 400);
    }

    const nouveauSolde = wallet.solde - montant;
    return await walletRepository.updateBalances(userId, { solde: nouveauSolde });
  }

  // 4. Bloquer des fonds (Utile pour initier un transfert international avant validation)
  async bloquerFonds(userId, montant) {
    if (montant <= 0) throw new AppError('Le montant doit être supérieur à 0.', 400);

    const wallet = await this.recupererParUtilisateur(userId);

    if (wallet.solde < montant) {
      throw new AppError('Solde disponible insuffisant pour bloquer ces fonds.', 400);
    }

    const nouveauSolde = wallet.solde - montant;
    const nouveauSoldeBloque = wallet.soldeBloque + montant;

    return await walletRepository.updateBalances(userId, { 
      solde: nouveauSolde, 
      soldeBloque: nouveauSoldeBloque 
    });
  }

  // 5. Libérer ou Confirmer des fonds bloqués
  async gererFondsBloques(userId, montant, action = 'CONFIRMER') {
    const wallet = await this.recupererParUtilisateur(userId);

    if (wallet.soldeBloque < montant) {
      throw new AppError('Le montant bloqué en base est inférieur à la demande.', 400);
    }

    if (action === 'CONFIRMER') {
      // Les fonds s'en vont définitivement du système de l'utilisateur
      const nouveauSoldeBloque = wallet.soldeBloque - montant;
      return await walletRepository.updateBalances(userId, { soldeBloque: nouveauSoldeBloque });
    } else if (action === 'ANNULER') {
      // Le transfert a échoué, on remet l'argent sur le solde disponible
      const nouveauSolde = wallet.solde + montant;
      const nouveauSoldeBloque = wallet.soldeBloque - montant;
      return await walletRepository.updateBalances(userId, { 
        solde: nouveauSolde, 
        soldeBloque: nouveauSoldeBloque 
      });
    }
  }*/
}

module.exports = new WalletService();