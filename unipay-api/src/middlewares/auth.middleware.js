const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
    try {
        // 1. on recupere le token dans l'en-têt Authorization
        // le format standard est: bearer <TOKEN>
        const autHeader = req.headers.authorization;

        // if (!autHeader || !autHeader.startsWith('Bearer ')) {
        //     return res.status(401).json({ success: false, message: "Token manquant." });
        // }
        if(!autHeader){
            throw Error('Accès refusé. Aucun jeton fourni.');
        }

        // on separe le mot bearer du jeton réel
        const token = autHeader.split(' ')[1];

        // 2. on vérifie la validité du jéton avec notre clé secrète
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        // 3. on ajoute les infos de lutilisateur décodée à l'objet rep
        // Cela permettra au controleur suivant de savoir qui fait la requête
        req.user = {
            id: decodedToken.id,
            role: decodedToken.role
        }

        // 4. on passe au middleware ou controller suivant
        next();

    } catch (error) {
        return res.status(401).json({
            succes: false,
            message: 'Jeton invalide ou expiré'
        });
    }
};