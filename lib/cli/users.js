const logger = require('../helpers/logger')
const MongoClient = require('../core/clients/mongodb-client')
const MongoUsersState = require('../core/state/mongo-users-state')

exports.command = 'users'

exports.describe = 'Sets up users against any mongo instance'

exports.builder = {
}

exports.handler = async (argv) => {
  logger.debug('Setting up users')

  const { uri } = argv.connection
  const { users } = argv
  const client = new MongoClient(uri)
  await client.connect()

  const userState = new MongoUsersState({ users, client })
  await userState.apply()
  await client.disconnect()
}
