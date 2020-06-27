const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')
const ReplicationCommands = require('../../../lib/core/commands/replication-commands')

test('stub: replication command "status" works as expected', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const replicationCommands = new ReplicationCommands(client)

  const response = await replicationCommands.status()

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, { replSetGetStatus: 1 })
  t.deepEqual(response, replies[0])
})

test('stub: replication command "getConfig" works as expected', async (t) => {
  const replies = [
    { config: { test: 1 } }
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const replicationCommands = new ReplicationCommands(client)

  const response = await replicationCommands.getConfig()

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, { replSetGetConfig: 1 })
  t.deepEqual(response, { test: 1 })
})

test('stub: replication command "initiate" works as expected', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const configuration = { fake: 'initiate' }
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const replicationCommands = new ReplicationCommands(client)

  const response = await replicationCommands.initiate(configuration)

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, { replSetInitiate: configuration })
  t.deepEqual(response, replies[0])
})

test('stub: replication command "reconfig" works as expected', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const configuration = { fake: 'reconfig' }
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const replicationCommands = new ReplicationCommands(client)

  const response = await replicationCommands.reconfig(configuration)

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, { replSetReconfig: configuration })
  t.deepEqual(response, replies[0])
})
