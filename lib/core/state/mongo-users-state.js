const UserCommands = require('../commands/user-commands')
const MongoClient = require('../clients/mongodb-client')
const logger = require('../../helpers/logger')

class MongoUsersState {
  /**
   *
   * @param {Object} settings Settings
   * @param {String} settings.users users to create
   */
  constructor(settings) {
    const { connection } = settings
    this.users = settings.users
    // Client
    this.client = settings.client || new MongoClient(connection.uri)
  }

  async apply() {
    // this should sync the users
    // for now it only creates/updates new ones
    const userCommands = new UserCommands(this.client)

    for (const user of this.users) {
      logger.debug('checking if user exits', user.user)
      const response = await userCommands.usersInfo(user.user)
      // If this array is filled it means the user exists
      if (response.users.length) {
        logger.debug('updating user', user.user)
        const resp = await userCommands.updateUser(user)
        if (!resp.ok) {
          throw new Error(`Unable to update user: ${user.user}`)
        }
      } else {
        logger.debug('creating user', user.user)
        const resp = await userCommands.createUser(user)
        if (!resp.ok) {
          throw new Error(`Unable to create user: ${user.user}`)
        }
      }
    }
  }
}

module.exports = MongoUsersState
