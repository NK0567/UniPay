const Joi = require('joi');

exports.validerInscription = (req, res, next) => {
  const schema = Joi.object({
    nom: Joi.string().max(100).required(),
    prenom: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    telephone: Joi.string().regex(/^\+[1-9]\d{1,14}$/).required(),
    motDePasse: Joi.string().min(8).required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
        success: false, 
        error: error.details[0].message });
    }
  next();
};

exports.validerConnexion = (req, res, next) => {
  const schema = Joi.object({
    identifiant: Joi.string().required(),
    motDePasse: Joi.string().required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
        success: false, 
        error: error.details[0].message });
    }
  next();
};

exports.validerDemandeReset = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
        success: false, 
        error: error.details[0].message });
    }
  next();
};

exports.validerExecutionReset = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    nouveauMotDePasse: Joi.string().min(8).required()
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
        success: false, 
        error: error.details[0].message });
    }
  next();
};

/**
 * 🛡️ Validateur pour la première configuration du PIN (4 chiffres obligatoires)
 */
exports.validerInitialiserPin = (req, res, next) => {
  const schema = Joi.object({
    utilisateurId: Joi.string().required(),
    nouveauPin: Joi.string()
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le nouveau code PIN doit être composé de exactement 4 chiffres.'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }
  next();
};

/**
 * 🛡️ Validateur pour la modification du PIN existant (Ancien et nouveau requis, 4 chiffres)
 */
exports.validerChangerPin = (req, res, next) => {
  const schema = Joi.object({
    utilisateurId: Joi.string().required(),
    ancienPin: Joi.string()
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': "L'ancien code PIN doit être composé de exactement 4 chiffres."
      }),
    nouveauPin: Joi.string()
      .pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.pattern.base': 'Le nouveau code PIN doit être composé de exactement 4 chiffres.'
      })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }
  next();
};






// const {body} = require('express-validator')

// const validateRegister = [
//     body("nom").notEmpty().withMessage('Le nom est obligatoire.').trim(),
//     body('prenom').notEmpty().withMessage('Le prenom est obligatoire').trim(),
//     body('email').isEmail().withMessage('email invalide').normalizeEmail(),
//     // body('téléphone').macthes(/^\+?[1-9]\d{1,14}$/).withMessage('Format de téléphone invalide (ex: +237 ....).'),
//     body("telephone")
//         .custom(value => {
//             const internationalRegex = /^\+?[1-9]\d{0,14}([ -]?\(?\d{1,4}\)?[ -]?\d{1,4})*$/;
//             const localRegex = /^0\d{9}$/; // Exemple pour la France avec 10 chiffres après 0
//             return internationalRegex.test(value) || localRegex.test(value);
//         })
//         .withMessage("Format de téléphone invalide."),
//     // body("motDePasse").isLength({ min: 8 }).withMessage("Le mot de passe doit contenir au moins 8 caractères.").matches(/\d/).withMessage("Le mot de passe doit contenir au moins un chiffre."),
//     body('motDePasse')
//         .isStrongPassword({minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
//         .withMessage('Le mot de passe doit contenir au moins 12 caractères, minimun une miniscule, une majiscule, un chiffre, au moins un caractère spécial(!@#$%...).'),
//     // body(pays).isLength({ min: 2, max: 2}).withMessage("Le pays doit être au format ISO (ex: 'CM', 'CI')?").toUpperCase(),
//     body("pays").isISO31661Alpha2().withMessage('Code de pays invalide(ex CM, FR, US)'),
//     // À la place de body("pays").isISO31661Alpha2()...
//     // body("pays")
//     //     .notEmpty().withMessage("Le pays est obligatoire.")
//     //     .toUpperCase()
//     //     .custom((value) => {
//     //         // Liste des pays officiellement supportés par la roadmap UniPay (Section 19 & 21)
//     //         const paysSupportes = ["CM", "CI", "SN", "GA", "TG", "FR", "US"]; 
//     //         if (!paysSupportes.includes(value)) {
//     //             throw new Error(`UniPay n'est pas encore disponible dans le pays (${value}). Pays acceptés : ${paysSupportes.join(", ")}`);
//     //         }
//     //         return true;
//     //     }),
//     // body(devisePrincipale).isLength({min: 3, max: 3}).withMessage("La devise doit être au format ISO (ex: 'XAF', 'USD')").toUpperCase()
//     body('devisePrincipale').isISO4217().withMessage('Code devise invalide (ex: XAF, EUR, USD)')
// ];

// const validateLogin = [
//     body("email").isEmail().withMessage("Email invalide.").normalizeEmail(),
//     body("motDePasse").notEmpty().withMessage("Le mot de passe est obligatoire.")
// ];

// const validateForgotPassword = [
//     body("email").isEmail().withMessage("Veuillez fournir un email valide.").normalizeEmail()
// ];

// const validateResetPassword = [
//     body("token").notEmpty().withMessage("Le jeton de réinitialisation est obligatoire."),
//     body('motDePasse')
//         .isStrongPassword({minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
//         .withMessage('Le mot de passe doit contenir au moins 12 caractères, minimun une miniscule, une majiscule, un chiffre, au moins un caractère spécial(!@#$%...).'),
// ];

// module.exports = { validateRegister, validateLogin, validateForgotPassword, validateResetPassword };