const prisma = require('../../../database/prisma');
const transferLinkService = require('../../lienPaiement/services/lien.service');

class WhatsappService {
  async analyserEtTraiterMessage(telephone, texte) {
    const commande = texte.trim().toUpperCase();
    
    // 1. Authentification stricte de l'expéditeur via son numéro
    // Formaté avec ou sans le "+" selon ton stockage BDD (Meta envoie sans le + par défaut, ex: "237690000000")
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { telephone: telephone },
          { telephone: `+${telephone}` }
        ]
      },
      include: { portefeuille: true }
    });

    if (!utilisateur) {
      return this.envoyerReponseWhatsApp(telephone, "❌ Numéro non reconnu. Vous devez posséder un compte UniPay actif pour utiliser ce bot. Inscrivez-vous sur https://unipay-app.com");
    }

    // 2. Traitement du menu et des commandes financières
    console.log(`🤖 Bot UniPay sollicité par ${utilisateur.prenom} (${telephone}) -> Commande: "${commande}"`);

    // COMMANDE 1 : Consultation du solde
    if (commande === 'SOLDE') {
      if (!utilisateur.portefeuille) {
        return this.envoyerReponseWhatsApp(telephone, `Désolé ${utilisateur.prenom}, aucun portefeuille n'est rattaché à votre compte.`);
      }
      const soldeDispo = parseFloat(utilisateur.portefeuille.solde).toFixed(2);
      const devise = utilisateur.portefeuille.devise;
      
      return this.envoyerReponseWhatsApp(telephone, `💳 *UniPay - Votre Solde*\n\nBonjour ${utilisateur.prenom},\nLe solde disponible sur votre portefeuille est de : *${soldeDispo} ${devise}*.`);
    }

    // COMMANDE 2 : Génération d'un lien de paiement (Syntaxe: "LIEN 5000")
    if (commande.startsWith('LIEN')) {
      const parties = commande.split(' ');
      const montant = parseFloat(parties[1]);

      if (isNaN(montant) || montant <= 0) {
        return this.envoyerReponseWhatsApp(telephone, "❌ Format incorrect. Pour générer un lien de paiement, envoyez : *Lien [Montant]* (Exemple : Lien 5000)");
      }

      try {
        // On utilise directement ton module existant et blindé !
        const resultatLien = await transferLinkService.genererLienSigne(utilisateur.id, utilisateur.portefeuille.id);
        
        return this.envoyerReponseWhatsApp(telephone, `🔗 *UniPay - Lien de Paiement Généré*\n\nVoici votre lien sécurisé de *${montant} ${utilisateur.portefeuille.devise}* valides pour 24h :\n\n${resultatLien.lienDePartage}\n\n_Partagez ce lien avec votre payeur pour recevoir les fonds instantanément._`);
      } catch (err) {
        return this.envoyerReponseWhatsApp(telephone, `❌ Impossible de générer le lien : ${err.message}`);
      }
    }

    // COMMANDE PAR DÉFAUT : Menu d'aide
    const messageAide = `👋 Bonjour ${utilisateur.prenom}, bienvenue sur le bot officiel *UniPay*.\n\nVoici les commandes disponibles :\n\n👉 Écrivez *Solde* : Pour consulter l'état de votre compte.\n👉 Écrivez *Lien [Montant]* : Pour générer un lien de paiement immédiat (Ex: Lien 2500).`;
    return this.envoyerReponseWhatsApp(telephone, messageAide);
  }

  /**
   * Simulation d'envoi (pour l'instant dans la console, bientôt l'API Meta Cloud)
   */
  async envoyerReponseWhatsApp(telephoneCible, messageTexte) {
    console.log(`\n📱 --- [SIMULATION ENVOI WHATSAPP VERS ${telephoneCible}] ---`);
    console.log(messageTexte);
    console.log(`---------------------------------------------------------\n`);
    return true;
  }
}

module.exports = new WhatsappService();