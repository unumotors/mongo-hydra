const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')

const { ReplicaSetState, REPLICA_SET_STATUS } = require('../../../lib/core/state/replication')

const replicaSetName = 'replication-test'

test.serial('ReplicaSetState refreshState can pick up UNINITIALIZED state', async (t) => {
  const uninitializedError = new Error()
  uninitializedError.code = 94

  const replies = [
    uninitializedError
  ]

  const client1 = new MongoClientStub(replies)
  const server1 = { host: 'replication-test-0:27000', client: client1 }

  const client2 = new MongoClientStub(replies)
  const server2 = { host: 'replication-test-1:27000', client: client2 }

  const servers = [server1, server2]
  const state = new ReplicaSetState({ replicaSetName, servers })

  await state.refreshState()

  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.UNINITIALIZED)
})

test.serial('ReplicaSetState handles HEALTHY state', async (t) => {
  const client1 = new MongoClientStub([{ myState: 1 }, { myState: 1 }])
  const server1 = { host: 'replication-test-0:27000', client: client1 }

  const client2 = new MongoClientStub([{ myState: 2 }, { myState: 2 }])
  const server2 = { host: 'replication-test-1:27000', client: client2 }

  const servers = [server1, server2]

  const state = new ReplicaSetState({ replicaSetName, servers })

  await state.refreshState()
  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.HEALTHY)

  await t.notThrowsAsync(async () => {
    await state.apply()
  })
})

test.serial('ReplicaSetState apply throws if initiation fails', async (t) => {
  const uninitializedError = new Error()
  uninitializedError.code = 94

  const client1 = new MongoClientStub([
    uninitializedError, // initial refreshState to get state
    { ok: 0, code: 666 } // answer to replica set initiation
  ])
  const server1 = { host: 'replication-test-0:27000', client: client1 }

  const client2 = new MongoClientStub([
    uninitializedError // initial refreshState to get state
  ])
  const server2 = { host: 'replication-test-1:27000', client: client2 }

  const servers = [server1, server2]

  const state = new ReplicaSetState({ replicaSetName, servers })

  await t.throwsAsync(async () => {
    await state.apply()
  }, { message: 'Failed replica set initiation with: {"ok":0,"code":666}' })
})

test.serial('ReplicaSetState apply does initialize a UNINITIALIZED replica set', async (t) => {
  const uninitializedError = new Error()
  uninitializedError.code = 94

  const client1 = new MongoClientStub([
    uninitializedError, // initial refreshState to get state
    { ok: 1 }, // answer to replica set initiation
    uninitializedError, // first waitUntilHealthy should fail
    { myState: 1 } // second waitUntilHealthy should pass
  ])
  const server1 = { host: 'replication-test-0:27000', client: client1 }

  const client2 = new MongoClientStub([
    uninitializedError, // initial refreshState to get state
    { myState: 2 }, // waitUntilHealthy
    { myState: 2 } // waitUntilHealthy
  ])
  const server2 = { host: 'replication-test-1:27000', client: client2 }

  const servers = [server1, server2]

  const state = new ReplicaSetState({ replicaSetName, servers })

  await state.apply()

  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.HEALTHY)
})

test.serial('ReplicaSetState apply throws if it cannot detect the replica state state', async (t) => {
  const uninitializedError = new Error()
  uninitializedError.code = 94

  const client1 = new MongoClientStub([
    { myState: 2 } // second waitUntilHealthy should pass
  ])
  const server1 = { host: 'replication-test-0:27000', client: client1 }

  const client2 = new MongoClientStub([
    { myState: 3 } // waitUntilHealthy
  ])
  const server2 = { host: 'replication-test-1:27000', client: client2 }

  const servers = [server1, server2]

  const state = new ReplicaSetState({ replicaSetName, servers })

  await t.throwsAsync(async () => {
    await state.apply()
  }, { message: 'replication-test: Replica set status unknown. Cannot apply configuration.' })

  t.is(state.replicaSetStatus, REPLICA_SET_STATUS.UNKNOWN)
})

test('replication configuration structure works as expected for non config servers', (t) => {
  const servers = [
    { host: 'mongod-0:0' },
    { host: 'mongod-1:1' },
    { host: 'mongod-2:2' }
  ]

  const state = new ReplicaSetState({ replicaSetName, servers })

  const mongoConfig = state.toMongoConfiguration()
  t.deepEqual(mongoConfig, {
    _id: replicaSetName,
    members: [
      { _id: 0, host: 'mongod-0:0' },
      { _id: 1, host: 'mongod-1:1' },
      { _id: 2, host: 'mongod-2:2' }
    ]
  })
})
