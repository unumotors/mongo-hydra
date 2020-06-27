const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')
const DiagnosticCommands = require('../../../lib/core/commands/basic-commands')

test('stub clients helps out when forgetting a reply', async (t) => {
  const replies = []
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const basicCommands = new DiagnosticCommands(client)

  await t.throwsAsync(async () => {
    await basicCommands.ping()
  }, { message: 'Stubbing error. MongoClientStub is out of replies and does not know how to answer "{"ping":1}"' })
})

test('stub clients has all required functions', async (t) => {
  const replies = []
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing

  await t.notThrowsAsync(async () => {
    await client.useDatabase()
  })
})
