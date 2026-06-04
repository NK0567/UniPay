const prisma = require('../../../database/prisma');

class SecuriteRepository {
  /**
   * Compte le nombre d'échecs de transaction ou de PIN récents pour un utilisateur
   */
  async compterEchecsRecents(walletId, minutes = 15) {
  const limiteTemps = new Date(Date.now() - minutes * 60 * 1000);
  
  // Renvoie directement le compte numérique
  return await prisma.transaction.count({
    where: {
      walletSourceId: walletId,
      statut: "ECHEC",
      motifEchec: {
        in: [
          "CODE_PIN_INCORRECT",
          "TENTATIVE_FRAUDE",
          "AUTHENTIFICATION_ECHOUER" 
        ]
      },
      dateTransaction: { // ✅ Correction du nom du champ
        gte: limiteTemps
      }
    }
  });
}

  /**
   * Verrouille instantanément un portefeuille avec un motif précis
   */
  async bloquerPortefeuille(walletId, motif) {
    return await prisma.portefeuille.update({
      where: { id: walletId },
      data: {
        statut: "BLOQUE",
        // Si tu as un champ de description ou de logs de sécurité dans ton modèle :
        description: `Verrouillé par le système de sécurité. Motif : ${motif}`
      }
    });
  }

  /**
   * Enregistre un log d'audit de sécurité strict
   */
  async enregistrerLogSecurite(donneesLog) {
    return await prisma.logSecurite.create({
      data: {
        utilisateurId: donneesLog.utilisateurId,
        action: donneesLog.action,
        severite: donneesLog.severite, // 'INFO', 'WARNING', 'CRITICAL'
        adresseIp: donneesLog.adresseIp,
        details: donneesLog.details
      }
    });
  }
}

module.exports = new SecuriteRepository();