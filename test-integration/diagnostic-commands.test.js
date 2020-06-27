const test = require('ava')
const DiagnosticCommands = require('../lib/core/commands/basic-commands')
const MongoClient = require('../lib/core/clients/mongodb-client')

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017'

test('diagnostic command "ping" works as expected', async (t) => {
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const basicCommands = new DiagnosticCommands(client)

  const response = await basicCommands.ping()

  t.deepEqual(response.ok, 1)
})
