const test = require('ava')
const Joi = require('@hapi/joi')
const { schema } = require('../../../lib/cli/schemas/replication-state-schema')

const replicaSetName = 'replication-test'

test.serial('A valid replica state object is detected as such', (t) => {
  const server1 = { host: 'replication-test-0:27000', uri: 'mongodb://localhost:27000' }

  const server2 = { host: 'replication-test-1:27000', uri: 'mongodb://localhost:27001' }

  const servers = [server1, server2]

  const validObject = { replicaSet: { replicaSetName, servers } }

  const { error, value } = schema.validate(validObject)

  t.is(error, undefined)
  t.deepEqual(value, validObject)
})

test.serial('A invalid schema is detected as such', (t) => {
  const validObject = { replicaSet: undefined }

  const { error } = schema.validate(validObject)

  t.true(error instanceof Joi.ValidationError)
})
