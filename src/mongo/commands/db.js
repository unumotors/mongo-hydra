/* eslint no-await-in-loop: 0 */

class DBCommands {
  constructor(client) {
    this.client = client
  }

  async isMaster() {
    return this.client.sendCommand({ isMaster: 1 })
  }

  /**
   * additionalOptions will be deconstructed into the passed options.
   * eg for { authenticationRestrictions: }
   */
  async createRole(roleName, privileges, roles, additionalOptions = {}) {
    const command = {
      createRole: roleName,
      privileges,
      roles,
      ...additionalOptions
    }
    return this.client.sendCommand(command)
  }

  async createUser(user, password, roles, additionalOptions = {}) {
    const command = {
      createUser: user,
      pwd: password,
      roles,
      ...additionalOptions
    }
    return this.client.sendCommand(command)
  }

  async createCertificateUsers(subject, roles) {
    const command = {
      createUser: subject,
      roles
    }
    return this.client.sendCommand(command)
  }

  async getUsers() {
    const data = await this.client.sendCommand({ usersInfo: 1 })
    return data.users || data
  }

  async updateUser(username, options) {
    const command = {
      updateUser: username,
      ...options
    }
    return this.client.sendCommand(command)
  }

  async dropUser(username) {
    return this.client.sendCommand({ dropUser: username })
  }

  async getRoles(options = { showPrivileges: true, showBuiltinRoles: false }) {
    const command = { rolesInfo: 1, ...options }
    const data = await this.client.sendCommand(command)
    return data.roles || data
  }

  // mongo db.getRole() function returns wrong roles, use getRoles instead
  async getRole(roleName, options = { rolesInfo: 1, showPrivileges: true, showBuiltinRoles: false }) {
    const command = { rolesInfo: roleName, ...options }
    return this.client.sendCommand(command)
  }

  async dropRole(rolename) {
    return this.client.sendCommand({ dropRole: rolename })
  }

  async updateRole(rolename, options) {
    const command = {
      updateRole: rolename,
      ...options
    }
    return this.client.sendCommand(command, true)
  }
}

module.exports = DBCommands
