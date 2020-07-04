const test = require('ava')
const crypto = require('crypto')

const UserCommands = require('../lib/core/commands/user-commands')
const MongoClient = require('../lib/core/clients/mongodb-client')

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:29017'

const username = crypto.randomBytes(20).toString('hex')
const user = {
  user: username,
  password: 'pass1234',
  customData: {
    foo: 'bar'
  }
}

test.serial('user command "createUser" works as expected', async (t) => {
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const userCommands = new UserCommands(client)

  const response = await userCommands.createUser(user)

  t.deepEqual(response, { ok: 1 })
})

test.serial('user command "userInfo" works as expected', async (t) => {
  const info = username
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const userCommands = new UserCommands(client)

  const response = await userCommands.usersInfo(info)

  const responseUser = response.users[0]

  t.deepEqual(responseUser.customData, user.customData)
  t.deepEqual(responseUser.db, 'admin')
  t.deepEqual(responseUser.roles, [])
  t.deepEqual(responseUser.user, user.user)
  // bunch of others in the object
  // t.deepEqual(responseUser, {})
})

test.serial('user command "updateUser" works as expected', async (t) => {
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const userCommands = new UserCommands(client)

  const response = await userCommands.updateUser(user)
  t.deepEqual(response, { ok: 1 })
})
