const Joi = require('joi');

module.exports.assignmentSchema = Joi.object({
    assign: Joi.object({
        mode: Joi.string().required(),
        pref1: Joi.number().required(),
        pref2: Joi.number().required(),
        pref3: Joi.number().required(),
    }).required()
})