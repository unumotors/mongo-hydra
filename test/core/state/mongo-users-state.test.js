const test = require('ava')
const MongoClientStub = require('../../../lib/core/clients/stub-client')

const UsersState = require('../../../lib/core/state/mongo-users-state')

test.serial('creates default client if not supplied', (t) => {
  const connection = { uri: 'mongodb://localhost' }
  const state = new UsersState({ connection, users: [] })
  t.truthy(state.client)
})

test.serial('Creates user if not found', async (t) => {
  const replies = [
    { users: [] }, // empty users list == create user
    { ok: 1 }
  ]

  const users = [
    { user: 'foo', password: 'password' }
  ]

  const client = new MongoClientStub(replies)

  const state = new UsersState({ client, users })

  await state.apply()
  t.deepEqual(client.getLastCommand(), {
    createUser: 'foo',
    customData: {},
    // internally mongo uses pwd
    pwd: 'password',
    roles: []
  })
})

test.serial('updates user if found', async (t) => {
  const replies = [
    { users: [{ user: 'foo' }] }, // empty users list == create user
    { ok: 1 }
  ]

  const users = [
    { user: 'foo', password: 'password' }
  ]

  const client = new MongoClientStub(replies)

  const state = new UsersState({ client, users })

  await state.apply()
  t.deepEqual(client.getLastCommand(), {
    updateUser: 'foo',
    customData: {},
    // internally mongo uses pwd
    pwd: 'password',
    roles: []
  })
})

test.serial('throws an error if user not created', async (t) => {
  const replies = [
    { users: [] }, // empty users list == create user
    { notok: 1 }
  ]

  const users = [
    { user: 'foo', password: 'password' }
  ]

  const client = new MongoClientStub(replies)

  const state = new UsersState({ client, users })

  const error = await t.throwsAsync(async () => {
    await state.apply()
  })
  t.is(error.message, 'Unable to create user: foo')
})

test.serial('throws an error if user not updated', async (t) => {
  const replies = [
    { users: [{ user: 'foo' }] }, // user list == update
    { notok: 1 }
  ]

  const users = [
    { user: 'foo', password: 'password' }
  ]

  const client = new MongoClientStub(replies)

  const state = new UsersState({ client, users })

  const error = await t.throwsAsync(async () => {
    await state.apply()
  })
  t.is(error.message, 'Unable to update user: foo')
})
