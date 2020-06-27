/**
 * This test file tests mongo replication without sharding and auth
 *
 * It claims the following mongod instances:
 * - replication-test-0
 * - replication-test-1
 * - replication-test-2
 *
 * They cannot be used in other tests
 *
 */
const test = require('ava')
const ReplicationCommands = require('../lib/core/commands/replication-commands')
const MongoClient = require('../lib/core/clients/mongodb-client')

const MONGO_TEST_REPLICATION_URIS = process.env.MONGO_TEST_REPLICATION_URIS
 || 'mongodb://localhost:27000,mongodb://localhost:27001,mongodb://localhost:27002'
const replicaURIs = MONGO_TEST_REPLICATION_URIS.split(',')

test.serial('All instances return uninitialized status error', async (t) => {
  t.plan(3)
  for (let index = 0; index < replicaURIs.length; index += 1) {
    const replicaURI = replicaURIs[index]
    const client = new MongoClient(replicaURI)
    await client.connect()
    const replicationCommands = new ReplicationCommands(client)
    await t.throwsAsync(async () => {
      await replicationCommands.status()
    }, { code: 94 })
  }
})
