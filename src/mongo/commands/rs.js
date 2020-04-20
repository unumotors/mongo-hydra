/* eslint no-await-in-loop: 0 */

class ReplicationCommands {
  constructor(client) {
    this.client = client
  }
  async status(showWarnings = true) {
    try {
      return this.client.sendCommand({ replSetGetStatus: 1 }, showWarnings)
    } catch (error) {
      return error
    }
  }

  buildRelicaSetConfig(name, hostnames, port) {
    let hosts = hostnames.map((host, index) => ({ _id: index, host: `${host}:${port}` }))
    const options = {
      _id: name,
      members: hosts
    }
    if (port == 27019) options.configsvr = true
    return options
  }

  async initiate(name, hostnames, port) {
    const command = {
      replSetInitiate: this.buildRelicaSetConfig(name, hostnames, port)
    }
    return this.client.sendCommand(command)
  }

  async conf() {
    const data = await this.client.sendCommand({ replSetGetConfig: 1 })
    return data.config || data
  }

  async reconfig(cfg, force = false) {
    const command = { replSetReconfig: cfg, force }
    return this.client.sendCommand(command)
  }
}

module.exports = ReplicationCommands
