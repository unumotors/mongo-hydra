class ReplicationCommands {
  constructor(client) {
    this.client = client
  }

  // Get replication status
  async status() {
    const command = { replSetGetStatus: 1 }
    return await this.client.command(command)
  }

  // Initiate a replica set
  async initiate(configuration) {
    const command = { replSetInitiate: configuration }
    return await this.client.command(command)
  }

  async reconfig(configuration) {
    const command = { replSetReconfig: configuration }
    return await this.client.command(command)
  }

  // Get the current config of a replica set
  async getConfig() {
    const command = { replSetGetConfig: 1 }
    const response = await this.client.command(command)
    return response.config
  }
}

module.exports = ReplicationCommands
