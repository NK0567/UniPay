const prisma = require('../../../database/prisma');

class TransferLinkRepository {
  async creerLien({ utilisateurId, portefeuilleId, code, token, signatureHmac, dateExpiration }) {
    return await prisma.lienPaiement.create({
      data: {
        code,
        token,
        signatureHmac,
        dateExpiration,
        statut: 'ACTIF',
        // 💡 CORRECTION PRISMA : Connexion explicite par les relations n-1
        utilisateur: {
          connect: { id: utilisateurId }
        },
        portefeuille: {
          connect: { id: portefeuilleId }
        }
      }
    });
  }

  async trouverLienValide(code) {
    return await prisma.lienPaiement.findFirst({
        where: {
            code,
            statut: 'ACTIF',
            dateExpiration: { gt: new Date() } // Doit être inférieur à 24h
        },
        include: {
            utilisateur: true
        }
    });
  }

  async executerPaiementSecurise({
    demandeurId,
    payeurId,
    walletDemandeurId,
    walletPayeurId,
    walletAdminId, // Peut être null si aucun admin n'existe
    montantBrutSource,
    fraisAdminSource,
    montantNetCible,
    tauxChange
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Débiter le portefeuille du Payeur
      await tx.portefeuille.update({
        where: { id: walletPayeurId },
        data: { 
            solde: { decrement: montantBrutSource } 
        }
      });

      // 2. Créditer le portefeuille du Demandeur
        await tx.portefeuille.update({
            where: { id: walletDemandeurId },
            data: { 
                solde: { increment: montantNetCible } 
            }
        });

      // 3. Routage : Si Admin présent -> Portefeuille Admin | Si non -> Coffre-fort Système
      if (walletAdminId) {
        await tx.portefeuille.update({
            where: { id: walletAdminId },
            data: { 
                solde: { increment: fraisAdminSource } 
            }
        });
      } else {
        await tx.coffreUniPay.upsert({
            where: { id: 'global_vault' },
            update: { cumulGainsXAF: 
                { increment: fraisAdminSource } 
            },
            create: { 
                id: 'global_vault', 
                cumulGainsXAF: fraisAdminSource 
            }
        });
      }

      // 4. Enregistrement de l'historique de transaction
      return await tx.transaction.create({
        data: {
          reference: `LINK-TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          type: 'TRANSFERT',
          montant: montantBrutSource,
          frais: fraisAdminSource,
          tauxChange: tauxChange,
          statut: 'SUCCES',
          utilisateurId: payeurId,
          agregateurId: 'ag_unipay'
        }
      });
    });
  }
}

module.exports = new TransferLinkRepository();