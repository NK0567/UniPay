const prisma = require('../../../database/prisma');

class AuditRepository {
  async enregistrer(donnees) {
    return await prisma.auditLog.create({
      data: {
        utilisateurId: donnees.utilisateurId || null,
        action: donnees.action,
        entite: donnees.entite,
        avant: donnees.avant || null,
        apres: donnees.apres || null,
        ip: donnees.ip || null,
        navigateur: donnees.navigateur || null
      }
    });
  }
}

module.exports = new AuditRepository();