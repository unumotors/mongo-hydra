const test = require('ava')
const crypto = require('crypto')

const MongoClient = require('../lib/core/clients/mongodb-client')
const MongoUsersState = require('../lib/core/state/mongo-users-state')
const UserCommands = require('../lib/core/commands/user-commands')

const MONGO_TEST_URI = process.env.MONGO_TEST_URI || 'mongodb://localhost:29017'

function userFactory() {
  const username = crypto.randomBytes(20).toString('hex')
  return {
    user: username,
    password: 'pass1234',
    customData: {
      foo: 'bar'
    }
  }
}

test.serial('create users if they don\t exist', async (t) => {
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const user1 = userFactory()
  const user2 = userFactory()
  const users = [user1, user2]

  const userState = new MongoUsersState({ users, client })
  await t.notThrowsAsync(userState.apply())
})

test.serial('create and update users if they exist', async (t) => {
  const client = new MongoClient(MONGO_TEST_URI)
  await client.connect()
  const user1 = userFactory()
  const user2 = userFactory()
  const users = [user1, user2]

  const userState = new MongoUsersState({ users, client })
  const userCommands = new UserCommands(client)
  await t.notThrowsAsync(userState.apply())

  user2.customData = { test: 123 }
  // multiple times will simply update them
  await t.notThrowsAsync(userState.apply())

  const response = await userCommands.usersInfo(user2.user)
  const responseUser = response.users[0]

  t.deepEqual(responseUser.customData, { test: 123 })
  t.deepEqual(responseUser.user, user2.user)
})
