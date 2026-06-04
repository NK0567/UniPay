const Joi = require('joi');

// Helper centralisé pour renvoyer les erreurs Joi au format UniPay
const validerSchema = (schema, req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.details[0].message 
    });
  }
  next();
};

exports.validerInscription = (req, res, next) => {
  const schema = Joi.object({
    nom: Joi.string().max(100).required(),
    prenom: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    telephone: Joi.string().regex(/^\+[1-9]\d{1,14}$/).required().messages({
      'string.pattern.base': 'Le numéro de téléphone doit être au format international (ex: +237690000000).'
    }),
    motDePasse: Joi.string().min(6).required()
  });
  validerSchema(schema, req, res, next);
};

exports.validerConnexion = (req, res, next) => {
  const schema = Joi.object({
    identifiant: Joi.string().required(), // Email ou Téléphone
    motDePasse: Joi.string().required()
  });
  validerSchema(schema, req, res, next);
};

exports.validerDemandeReset = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });
  validerSchema(schema, req, res, next);
};

exports.validerExecutionReset = (req, res, next) => {
  const schema = Joi.object({
    token: Joi.string().required(),
    nouveauMotDePasse: Joi.string().min(6).required()
  });
  validerSchema(schema, req, res, next);
};

exports.validerInitialiserPin = (req, res, next) => {
  const schema = Joi.object({
    utilisateurId: Joi.string().required(),
    nouveauPin: Joi.string().pattern(/^\d{4}$/).required().messages({
      'string.pattern.base': 'Le code PIN doit être composé de exactement 4 chiffres.'
    })
  });
  validerSchema(schema, req, res, next);
};

exports.validerChangerPin = (req, res, next) => {
  const schema = Joi.object({
    utilisateurId: Joi.string().required(),
    ancienPin: Joi.string().pattern(/^\d{4}$/).required(),
    nouveauPin: Joi.string().pattern(/^\d{4}$/).required().messages({
      'string.pattern.base': 'Le nouveau code PIN doit être composé de exactement 4 chiffres.'
    })
  });
  validerSchema(schema, req, res, next);
};