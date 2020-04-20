/* eslint no-await-in-loop: 0 */

const retry = require('../../helpers/retry')
const logger = require('winston')

class Sharding {
  constructor(client) {
    this.client = client
  }

  async health() {
    return this.client.commands.sh.status()
  }

  async addShard(replicaSetName, hostnames, port) {
    return this.client.commands.sh.addShard(replicaSetName, hostnames, port)
  }

  async addShards(config) {
    logger.info('')
    logger.info('**** Adding shards')
    for (let index = 0; index < config.length; index++) {
      const shard = config[index]
      const { replicaSetName, hostnames, port } = shard
      logger.info(`Adding shard ${replicaSetName} on port ${port} with hostnames: ${hostnames}`)
      await retry(async() => this.addShard(replicaSetName, hostnames, port))
    }
  }

  async applySharding(config) {
    logger.info('')
    logger.info('**** Applying sharding configuration')
    // Shard databases
    for (let index = 0; index < config.length; index++) {
      const { database } = config[index]
      const reply = await this.client.commands.sh.enableSharding(database)
      if (reply.code && reply.code == 23) {
        logger.info(`Sharding already enabled for database ${database}`)
        continue
      }
      logger.info(`Sharded database ${database}`)
    }
    // Shard collection with shard keys
    for (let index = 0; index < config.length; index++) {
      const { database, collections } = config[index]
      // Switch to correct db
      for (let index2 = 0; index2 < collections.length; index2++) {
        const { name, shardKey } = collections[index2]
        // Apply config
        const reply = await this.client.commands.sh.shardCollection(`${database}.${name}`, shardKey)
        if (reply.code && reply.code == 20) {
          logger.info(`Collection ${database}.${name} already sharded`)
          continue
        }
        logger.info(`Collection ${database}.${name} sharded with shard key ${JSON.stringify(shardKey)}`)
      }
    }
  }
}

module.exports = Sharding
