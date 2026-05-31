const securiteRepository = require('../repositories/securite.repository');
const walletRepository = require('../../portefeuille/repositories/wallet.repository');
const auditEventEmitter = require('../../../events/audit.event');

class SecuriteService {
  /**
   * 🛡️ ANALYSE ANTI-FRAUDE ATOMIQUE
   * À appeler lors d'une action sensible (Paiement, Retrait, Erreur de PIN)
   */
  async inspecterActiviteUtilisateur(utilisateurId, adresseIp) {
    const portefeuille = await walletRepository.findByUtilisateurId(utilisateurId);
    if (!portefeuille) return;

    // 1. Récupérer le nombre d'échecs critiques sur les 15 dernières minutes
    const echecsRecents = await securiteRepository.compterEchecsRecents(portefeuille.id, 15);

    // 2. Règle métier : Si plus de 3 échecs consécutifs -> Verrouillage automatique immédiat
    if (echecsRecents >= 3 && portefeuille.statut === "ACTIF") {
      await securiteRepository.bloquerPortefeuille(portefeuille.id, "Suspicion de Brute-Force ou Fraude répétée");
      
      // Enregistrement du log critique
      await securiteRepository.enregistrerLogSecurite({
        utilisateurId,
        action: "AUTO_LOCK_WALLET",
        severite: "CRITICAL",
        adresseIp,
        details: `Le portefeuille ${portefeuille.id} a été suspendu automatiquement après ${echecsRecents} échecs.`
      });

      // Déclencher un événement système (pour envoyer un mail/SMS d'alerte plus tard)
      auditEventEmitter.emit('alerte.securite', {
        utilisateurId,
        motif: "Blocage automatique pour échecs répétés.",
        date: new Date()
      });

      throw new Error("Sécurité : Votre compte UniPay a été temporairement verrouillé suite à plusieurs tentatives infructueuses. Veuillez contacter le support.");
    }
  }

  /**
   * Permet à un Admin ou Agent Humanitaire habilité de débloquer un compte manuellement
   */
  async leverBlocageManuel(walletId, adminId, motifJustification) {
    // 1. Mettre à jour le statut du portefeuille à ACTIF
    await prisma.portefeuille.update({
      where: { id: walletId },
      data: { statut: "ACTIF" }
    });

    // 2. Loguer qui a fait l'action pour garder une trace d'audit irréprochable devant le jury
    const portefeuille = await prisma.portefeuille.findUnique({ where: { id: walletId } });
    
    await securiteRepository.enregistrerLogSecurite({
      utilisateurId: portefeuille.utilisateurId,
      action: "MANUAL_UNLOCK",
      severite: "INFO",
      adresseIp: "0.0.0.0 (Back-Office)",
      details: `Compte débloqué manuellement par l'admin ID: ${adminId}. Justification : ${motifJustification}`
    });

    return { statut: "ACTIF", message: "Le portefeuille a été réactivé avec succès." };
  }
}

module.exports = new SecuriteService();