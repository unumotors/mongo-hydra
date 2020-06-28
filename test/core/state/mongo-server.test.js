const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')
const { MongoServerState, SERVER_REPLICATION_STATUS } = require('../../../lib/core/state/mongo-server')

const hostname = 'mongo-server:1'

test('mongo server class initializes with UNKNOWN state', async (t) => {
  const client = new MongoClientStub([])
  await client.connect() // does nothing
  const server = new MongoServerState(hostname, client)
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.UNKNOWN)
})

test('mongo server class detect that it cannot handle an error', async (t) => {
  const unknownError = new Error('unhandled-error')

  const replies = [
    unknownError
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const server = new MongoServerState(hostname, client)

  await t.throwsAsync(async () => {
    await server.refreshState()
  }, { message: unknownError.message })
})

test('mongo server class can detect UNINITIALIZED state', async (t) => {
  const uninitializedError = new Error()
  uninitializedError.code = 94

  const replies = [
    uninitializedError
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const server = new MongoServerState(hostname, client)

  await server.refreshState()

  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.UNINITIALIZED)
})

test('mongo server class refreshState throws if it encounters an unknown mongo error status code', async (t) => {
  const unknownError = new Error('unknown')
  unknownError.code = 666

  const replies = [
    unknownError
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const server = new MongoServerState(hostname, client)

  await t.throwsAsync(async () => {
    await server.refreshState()
  }, unknownError)
})

test('mongo server class can detect valid mongo states', async (t) => {
  const replies = [
    { myState: 0 },
    { myState: 1 },
    { myState: 2 },
    { myState: 3 },
    { myState: 5 },
    { myState: 6 },
    { myState: 7 },
    { myState: 8 },
    { myState: 9 }
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const server = new MongoServerState(hostname, client)

  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.STARTUP)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.PRIMARY)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.SECONDARY)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.RECOVERING)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.STARTUP2)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.UNKNOWN)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.ARBITER)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.DOWN)
  await server.refreshState()
  t.is(server.replicationStatus, SERVER_REPLICATION_STATUS.ROLLBACK)
})

test('mongo server class throws if it cannot handle mongo reply', async (t) => {
  const replies = [
    { unknown: 'response' }
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const server = new MongoServerState(hostname, client)

  await t.throwsAsync(async () => {
    await server.refreshState()
  }, { message: 'Unknown state of replica member: {"unknown":"response"}' })
})
