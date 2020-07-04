class UserCommands {
  constructor(client) {
    this.client = client
  }

  // https://docs.mongodb.com/manual/reference/command/createUser/
  async createUser(user) {
    const command = {
      createUser: user.user,
      // mongo internally uses pwd
      pwd: user.password,
      customData: user.customData || {},
      roles: user.roles || []
    }
    return await this.client.command(command)
  }

  // https://docs.mongodb.com/manual/reference/command/updateUser/
  async updateUser(user) {
    const command = {
      updateUser: user.user,
      // mongo internally uses pwd
      pwd: user.password,
      customData: user.customData || {},
      roles: user.roles || []
    }
    return await this.client.command(command)
  }

  // https://docs.mongodb.com/manual/reference/command/updateUser/
  async usersInfo(info) {
    const command = {
      usersInfo: info
    }
    return await this.client.command(command)
  }
}

module.exports = UserCommands
