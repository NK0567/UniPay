const Joi = require('joi');

const profilSchema = Joi.object({
  nom: Joi.string().trim().required(),
  prenom: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  telephone: Joi.string().trim().optional()
});

module.exports = { profilSchema };
