class UserCommands {
  constructor(client) {
    this.client = client
  }

  // https://docs.mongodb.com/manual/reference/command/createUser/
  async createUser(user) {
    const command = {
      createUser: user.user,
      customData: user.customData || {},
      roles: user.roles || []
    }

    // mongo internally uses pwd
    if (user.password) {
      command.pwd = user.password
    }
    // Use external db iff external is set
    if (user.external) {
      this.client.useDatabase('$external')
    }

    return await this.client.command(command)
  }

  // https://docs.mongodb.com/manual/reference/command/updateUser/
  async updateUser(user) {
    const command = {
      updateUser: user.user,
      customData: user.customData || {},
      roles: user.roles || []
    }

    // mongo internally uses pwd
    if (user.password) {
      command.pwd = user.password
    }
    // Use external db iff external is set
    if (user.external) {
      this.client.useDatabase('$external')
    }

    return await this.client.command(command)
  }

  // https://docs.mongodb.com/manual/reference/command/updateUser/
  async usersInfo(info, external = false) {
    const command = {
      usersInfo: info
    }
    // Use external db iff external is set
    if (external) {
      this.client.useDatabase('$external')
    }
    return await this.client.command(command)
  }
}

module.exports = UserCommands
