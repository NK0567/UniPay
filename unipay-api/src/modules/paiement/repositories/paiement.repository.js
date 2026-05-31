const prisma = require('../../../database/prisma');

class WalletRepository {
  async findByUtilisateurId(utilisateurId) {
    return await prisma.portefeuille.findUnique({
      where: { utilisateurId }
    });
  }

  async findAgregateursDisponibles(pays, typeRecherche) {
    return await prisma.agregateur.findMany({
      where: {
        pays: pays,
        statut: { in: ["ACTIF", "TEST"] },
        operationType: { in: [typeRecherche, "LES_DEUX"] }
      }
    });
  }

  async findConfigSysteme(cle) {
    return await prisma.configurationSysteme.findUnique({
      where: { cle }
    });
  }

  async findAdminPrincipal() {
    return await prisma.utilisateur.findFirst({
      where: { role: 'ADMIN' },
      include: { portefeuille: true }
    });
  }

  /**
   * Enregistre un échec de transaction directement en BDD
   */
  async enregistrerEchec(donneesEchec) {
    return await prisma.transaction.create({
      data: {
        type: donneesEchec.type,
        montant: donneesEchec.montant,
        deviseSource: donneesEchec.devise,
        deviseCible: donneesEchec.devise,
        statut: "ECHEC",
        motifEchec: donneesEchec.motif,
        description: donneesEchec.description,
        walletSourceId: donneesEchec.walletId,
        agregateurId: donneesEchec.agregateurId,
        referenceMarchand: donneesEchec.reference
      }
    });
  }

  /**
   * TRANSACTION ATOMIQUE : Exécute le mouvement financier (Dépôt ou Retrait)
   * et le split des gains admin de manière sécurisée (ACID)
   */
  async executerTransactionFinanciere(type, { portefeuille, montant, frais, marge, paysCode, reference, tiers, admin, gainAdmin }) {
    return await prisma.$transaction(async (tx) => {
      
      // 1. Mise à jour du solde utilisateur
      await tx.portefeuille.update({
        where: { id: portefeuille.id },
        data: { 
          solde: type === "DEPOT" 
            ? { increment: montant } 
            : { decrement: (montant + frais) } 
        }
      });

      // 2. Transfert de la marge vers l'admin si configuré
      if (admin && admin.portefeuille) {
        await tx.portefeuille.update({
          where: { id: admin.portefeuille.id },
          data: { solde: { increment: gainAdmin } }
        });

        // Historisation statistique dans le coffre global
        await tx.coffreUniPay.upsert({
          where: { id: 'global_vault' },
          update: { cumulGainsXAF: { increment: gainAdmin } },
          create: { id: 'global_vault', cumulGainsXAF: gainAdmin }
        });
      }

      // 3. Création de l'historique de transaction
      return await tx.transaction.create({
        data: {
          type: type,
          montant: montant,
          deviseSource: portefeuille.devise,
          deviseCible: portefeuille.devise,
          statut: "SUCCES",
          frais: frais,
          gainSpread: marge,
          paysOperation: paysCode,
          description: `${type} réussi de ${montant} ${portefeuille.devise}. Réf: ${reference}`,
          walletSourceId: portefeuille.id,
          agregateurId: tiers.agregateurId,
          referenceMarchand: reference,
          source: type === "DEPOT" ? tiers.telephone : portefeuille.id,
          destination: type === "DEPOT" ? portefeuille.id : tiers.telephone
        }
      });
    });
  }
}

module.exports = new WalletRepository();