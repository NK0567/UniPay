module.exports = (req, res, next)=>{
    // on suppose que le authMiddleware a déjà décodé le JWT et injecté le req.user
    if(!req.user || req.user.role !== "ADMIN"){
        return res.status(403).json({
            succes: false,
            message: 'Accès refusé, Cette zone est reservé aux adminisatreurs d\'UniPay'
        });
    }
    next();
};