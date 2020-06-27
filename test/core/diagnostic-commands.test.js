const test = require('ava')
const MongoClientStub = require('../../lib/core/clients/stub-client')
const DiagnosticCommands = require('../../lib/core/commands/basic-commands')
const MongoClient = require('../../lib/core/clients/mongodb-client')

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017'

test('stub: diagnostic command "ping" works as expected', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const basicCommands = new DiagnosticCommands(client)

  const response = await basicCommands.ping()

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, { ping: 1 })
  t.deepEqual(response, { ok: 1 })
})

test('real: diagnostic command "ping" works as expected', async (t) => {
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const basicCommands = new DiagnosticCommands(client)

  const response = await basicCommands.ping()

  t.deepEqual(response, { ok: 1 })
})
