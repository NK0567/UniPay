module.exports = (err, req, res, next)=>{
    console.error(err.stack) // on affiche l'erreur dans la console pour le developpeur

    // si l'erreur à un status spécifique, on l'utilise, sinon on met 500 (erreur serveur)
    const status = err.status || 500
    const message = err.message || "une erreur interne est survenue sur le server UniPay.";

    res.status(status).json({
        succes: false,
        message: message,
        // on envoie le détail de l'erreur (stack) que si on est en mode developpeur
        stack: process.env.NODE_ENV === 'developement' ? err.stack : {}
    })
}