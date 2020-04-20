/* eslint no-await-in-loop: 0 */

class ShardingCommands {
  constructor(client) {
    this.client = client
  }

  async status() {
    return this.client.sendCommand({ getShardMap: 1 })
  }

  async addShard(replicaSetName, hosts, port) {
    const hostsString = hosts.map(host => `${host}:${port}`).join(',')
    const options = `${replicaSetName}/${hostsString}`
    return this.client.sendCommand({ addShard: options })
  }

  async enableSharding(database) {
    return this.client.sendCommand({ enableSharding: database }, false)
  }

  async shardCollection(namespace, key, unique = false, options = {}) {
    const command = {
      shardCollection: namespace,
      key,
      unique,
      ...options
    }
    return this.client.sendCommand(command, false)
  }
}

module.exports = ShardingCommands
