const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')
const UserCommands = require('../../../lib/core/commands/user-commands')

test('user command "createUser" works as expected', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const user = {
    user: 'david',
    password: 'pass1234',
    customData: {
      foo: 'bar'
    }
  }
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const userCommands = new UserCommands(client)

  const response = await userCommands.createUser(user)

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, {
    createUser: 'david',
    // internally mongo uses pwd
    pwd: 'pass1234',
    customData: { foo: 'bar' },
    roles: []
  })
  t.deepEqual(response, { ok: 1 })
})

test('user command "createUser" works as expected with default params', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const user = {
    user: 'david',
    password: 'pass1234'
  }
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const userCommands = new UserCommands(client)

  const response = await userCommands.createUser(user)

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, {
    createUser: 'david',
    // mongo internally uses pwd
    pwd: 'pass1234',
    customData: { },
    roles: []
  })
  t.deepEqual(response, { ok: 1 })
})

test('user command "updateUser" works as expected', async (t) => {
  const replies = [
    { ok: 1 }
  ]
  const user = {
    user: 'david',
    password: 'pass1234'
  }
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const userCommands = new UserCommands(client)

  const response = await userCommands.updateUser(user)

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, {
    updateUser: 'david',
    // internally mongo uses pwd
    pwd: 'pass1234',
    customData: { },
    roles: []
  })
  t.deepEqual(response, { ok: 1 })
})

test('user command "usersInfo" works as expected', async (t) => {
  const replies = [
    { users: [], ok: 1 }
  ]
  const user = {
    user: 'david',
    password: 'pass1234',
    customData: {
      foo: 'bar'
    }
  }
  const client = new MongoClientStub(replies)
  await client.connect() // does nothing
  const userCommands = new UserCommands(client)

  const response = await userCommands.usersInfo(user.user)

  const sentCommand = client.getLastCommand()
  t.deepEqual(sentCommand, {
    usersInfo: 'david'
  })
  t.deepEqual(response, replies[0])
})
