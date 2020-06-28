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

const { ReplicaSetState, REPLICA_SET_STATUS } = require('../lib/core/state/replication')

const replicaSetName = 'replication-test'
const servers = [
  {
    host: 'replication-test-0:27000',
    uri: 'mongodb://localhost:27000'
  },
  {
    host: 'replication-test-1:27001',
    uri: 'mongodb://localhost:27001'
  },
  {
    host: 'replication-test-2:27002',
    uri: 'mongodb://localhost:27002'
  }
]

test.serial('ReplicaSetState can pick up uninitialized state', async (t) => {
  const state = new ReplicaSetState({ replicaSetName, servers })
  await state.refreshState()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.UNINITIALIZED)
})

test.serial('ReplicaSetState can initialize replica set', async (t) => {
  const state = new ReplicaSetState({ replicaSetName, servers })
  await state.apply()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.HEALTHY)
})

test.serial('ReplicaSetState can detect a healthy replica set', async (t) => {
  const state = new ReplicaSetState({ replicaSetName, servers })
  await state.refreshState()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.HEALTHY)
})
