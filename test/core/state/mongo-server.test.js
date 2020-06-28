const test = require('ava')
const MongoClient = require('../../../lib/core/clients/mongodb-client')
const MongoServerState = require('../../../lib/core/state/mongo-server')

const host = 'mongo-server:1'

test('mongo server creates MongoClient instance by default', (t) => {
  const server = new MongoServerState({ host })
  t.true(server.client instanceof MongoClient)
  t.is(server.client.uri, host)
})

test('mongo server can overwrite client uri', (t) => {
  const uri = 'uri-123'
  const server = new MongoServerState({ host, uri })
  t.is(server.uri, uri)
  t.is(server.host, host)
  t.is(server.client.uri, uri)
})
