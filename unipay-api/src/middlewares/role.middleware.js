/**
 * 🛡️ MIDDLEWARE DE RESTRICTION PAR RÔLE
 * S'exécute TOUJOURS après le authMiddleware (qui injecte req.user)
 * @param {String[]} rolesAutorises - Tableau des rôles ayant droit d'accès
 */
const roleMiddleware = (rolesAutorises) => {
  return (req, res, next) => {
    try {
      // 1. Vérifier si l'utilisateur est bien présent (injecté par authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Accès refusé : Utilisateur non authentifié dans le contexte de la requête."
        });
      }

      // 2. Vérifier si le rôle de l'utilisateur fait partie des rôles autorisés
      const roleUtilisateur = req.user.role; // Ex: 'CLIENT' ou 'ADMIN'

      if (!rolesAutorises.includes(roleUtilisateur)) {
        return res.status(403).json({
          success: false,
          error: "Privilèges insuffisants : Vous n'avez pas l'autorisation d'accéder à cette ressource."
        });
      }

      // 3. Si tout est OK, on passe au contrôleur suivant
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Erreur interne lors de la vérification des droits d'accès."
      });
    }
  };
};

module.exports = roleMiddleware;