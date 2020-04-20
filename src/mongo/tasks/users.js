/* eslint no-await-in-loop: 0 */

const { compare, arrayToMap } = require('../../helpers/array')
const logger = require('winston')
const settings = require('../../config/settings').userManagement

class Users {
  constructor(client) {
    this.client = client
  }

  async getRolesNamesFromUserRoles(roles) {
    return roles.map(r => ({
      role: r.name || r.role,
      db: r.db || 'admin'
    }))
  }

  async addUsers(usersToAdd) {
    for (let index = 0; index < usersToAdd.length; index++) {
      let {
        username, password, roles, subject
      } = usersToAdd[index]
      roles = await this.getRolesNamesFromUserRoles(roles)

      if (subject) { // Cert user
        await this.client.commands.db.createCertificateUsers(subject, roles)
      } else if (username) { // Normal user
        await this.client.commands.db.createUser(username, password, roles)
      }
    }
  }

  roleNamesFromRole(roles) {
    return roles.map(r => r.role || r.name)
  }

  async updateUsers(usersToUpdate, database) {
    const serverUsersMap = this.serverUsersMap[database]
    for (let index = 0; index < usersToUpdate.length; index++) {
      const userToUpdate = usersToUpdate[index]
      const { username, subject } = userToUpdate
      const serverUser = await serverUsersMap[username || subject]
      // Check if anything significant changed
      if (compare(this.roleNamesFromRole(userToUpdate.roles), this.roleNamesFromRole(serverUser.roles))) {
        continue
      }
      // Ideally we would use this function, but db.updateUser() does not work
      // await this.client.commands.db.updateUser(userToUpdate.username, userToUpdate)

      await this.removeUsers([userToUpdate])
      await this.addUsers([userToUpdate])
      //   logger.info(`Role ${name} was updated`)
      logger.info(`User ${username || subject} was updated`)
    }
  }

  async removeUsers(usersToRemove) {
    for (let index = 0; index < usersToRemove.length; index++) {
      const { username, subject } = usersToRemove[index]
      await this.client.commands.db.dropUser(username || subject)
    }
  }

  async applyUsers(usersToApply, database) {
    await this.client.useDatabase(database)
    const serverUsers = this.serverUsers[database]
    logger.info(`Applying user(s) in ${database} database`)

    let usersToApplyMap = arrayToMap(usersToApply, 'username', 'subject')
    const userNamesToApply = usersToApply.map(u => u.username || u.subject)

    const toBeAdded = userNamesToApply.filter(x => !serverUsers.includes(x))
    const toBeRemoved = serverUsers.filter(x => !userNamesToApply.includes(x))
    const alreadyExisting = userNamesToApply.filter(value => serverUsers.indexOf(value) != -1)

    function getUserObjectsForArray(users) {
      return users.map(u => {
        const cached = usersToApplyMap[u]
        if (cached) return cached
        if (u.includes('/CN')) { return { subject: u } }
        return { username: u }
      })
    }

    if (settings.addUsers && toBeAdded.length) {
      logger.info(`Adding user(s) ${toBeAdded}`)
      await this.addUsers(getUserObjectsForArray(toBeAdded))
    }
    if (settings.removeUsers && toBeRemoved.length) {
      logger.info(`Removing user(s) ${toBeRemoved}`)
      await this.removeUsers(getUserObjectsForArray(toBeRemoved))
      logger.info('Remove finished')
    }

    if (settings.updateUsers && alreadyExisting.length) {
      logger.info(`Updating user(s) ${alreadyExisting}`)
      await this.updateUsers(getUserObjectsForArray(alreadyExisting), database)
    }
  }

  async getUsersInDb(dbName) {
    await this.client.useDatabase(dbName)
    return this.client.commands.db.getUsers()
  }

  seperateUsersIntoDatabases(config) {
    const databases = {}
    config.forEach(user => {
      if (!databases[user.database]) databases[user.database] = []
      databases[user.database].push(user)
    })
    return databases
  }

  async cacheUsers(config) {
    const usernames = {}
    const userData = {}
    // Users in individual databases
    for (let index = 0; index < config.length; index++) {
      const { database } = config[index]
      if (usernames[database]) continue
      const users = await this.getUsersInDb(database)
      // Make list of users in dbs
      if (!usernames[database]) usernames[database] = []
      usernames[database] = users.map(u => u.user)
      // Make map of all users
      if (!userData[database]) userData[database] = {}
      userData[database] = arrayToMap(users, 'user')
    }
    // Make queryable
    this.serverUsers = usernames
    this.serverUsersMap = userData
  }

  async apply(config) {
    logger.info('')
    logger.info('**** Apply users configuration')
    await this.cacheUsers(config)

    logger.info(`User config will applied to these databases: ${Object.keys(this.serverUsers).join(', ')}`)

    const individualDatabases = this.seperateUsersIntoDatabases(config)
    const databaseNames = Object.keys(individualDatabases)

    for (let index = 0; index < databaseNames.length; index++) {
      const dbName = databaseNames[index]
      const dbConfig = individualDatabases[dbName]
      await this.applyUsers(dbConfig, dbName)
    }
  }
}

module.exports = Users
