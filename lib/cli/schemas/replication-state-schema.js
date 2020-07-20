const Joi = require('@hapi/joi')

const schema = Joi.object({
  replicaSet: Joi.object({
    replicaSetName: Joi.string().required(),
    servers:
     Joi.array().min(1).required()
       .items(Joi.object({
         host: Joi.string().required(),
         uri: Joi.string().uri()
       }))
  }).required()
}).unknown(true) // This allows other keys alongside "replicaSet" (argv adds private properties)

module.exports = {
  schema
}
