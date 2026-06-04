const Joi = require('joi');

const transactionSchema = Joi.object({
  montant: Joi.number().positive().required(),
  deviseSource: Joi.string().trim().required(),
  deviseCible: Joi.string().trim().required()
});

module.exports = { transactionSchema };
