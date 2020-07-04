const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')
const DiagnosticCommands = require('../../../lib/core/commands/diagnostic-commands')

test('diagnostic command "ping" works as expected', async (t) => {
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
