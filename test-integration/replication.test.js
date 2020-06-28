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

const { MongoServerState } = require('../lib/core/state/mongo-server')
const MongoClient = require('../lib/core/clients/mongodb-client')

const { ReplicaSetState, REPLICA_SET_STATUS } = require('../lib/core/state/replication')
const { ReplicationConfiguration } = require('../lib/core/structures/replication-structures')

const replicaSetName = 'replication-test'
const data = [
  {
    hostname: 'replication-test-0:27000',
    uri: 'mongodb://localhost:27000'
  },
  {
    hostname: 'replication-test-1:27001',
    uri: 'mongodb://localhost:27001'
  },
  {
    hostname: 'replication-test-2:27002',
    uri: 'mongodb://localhost:27002'
  }
]
const servers = []

for (let index = 0; index < data.length; index += 1) {
  const { hostname, uri } = data[index]
  const client = new MongoClient(uri)
  const server = new MongoServerState(hostname, client)
  data[index].server = server
  servers.push(server)
}

test.serial('ReplicaSetState can pick up uninitialized state', async (t) => {
  const configuration = new ReplicationConfiguration({ replicaSetName, servers })

  const state = new ReplicaSetState(configuration)
  await state.refreshState()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.UNINITIALIZED)
})

test.serial('ReplicaSetState can initialize replica set', async (t) => {
  const configuration = new ReplicationConfiguration({ replicaSetName, servers })

  const state = new ReplicaSetState(configuration)
  await state.apply()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.HEALTHY)
})

test.serial('ReplicaSetState can detect a healthy replica set', async (t) => {
  const configuration = new ReplicationConfiguration({ replicaSetName, servers })

  const state = new ReplicaSetState(configuration)
  await state.refreshState()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.HEALTHY)
})
