/**
 * 🌍 CONSTANTES GLOBALES DE L'ÉCOSYSTÈME UNIPAY
 */
module.exports = {
  ROLES: {
    ADMIN: 'ADMIN',
    AGENT_HUMANITAIRE: 'AGENT_HUMANITAIRE',
    CLIENT: 'CLIENT'
  },
  
  STATUT_PORTEFEUILLE: {
    ACTIF: 'ACTIF',
    BLOQUE: 'BLOQUE',
    SUSPENDU: 'SUSPENDU'
  },
  
  STATUT_TRANSACTION: {
    EN_ATTENTE: 'EN_ATTENTE',
    SUCCES: 'SUCCES',
    ECHEC: 'ECHEC'
  },

  TYPE_TRANSACTION: {
    DEPOT: 'DEPOT',
    RETRAIT: 'RETRAIT',
    TRANSFERT: 'TRANSFERT'
  },

  KYC_LEVELS: {
    NIVEAU_0: 'NIVEAU_0', // Non vérifié
    NIVEAU_1: 'NIVEAU_1', // Pièce d'identité validée
    NIVEAU_2: 'NIVEAU_2'  // Justificatif de domicile validé
  }
};