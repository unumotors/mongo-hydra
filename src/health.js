const MongoConfigurator = require('./mongo')
const logger = require('winston')

async function geatherHealth(config) {
  const status = {}

  // Get config server status
  if (config.cluster) {
    status.replication = {
      shards: [],
      configServer: {}
    }

    const { configServer, shards } = config.cluster
    // Get cfg server status
    try {
      const port = configServer.port || 27019
      const configServerClient = await new MongoConfigurator(configServer.hosts, port).init()
      status.replication.configServer = await configServerClient.tasks.replication.health(configServer)
    } catch (error) {
      logger.error('Error during config server healthcheck')
      console.error(error)
    }

    // Get shards server status
    try {
      status.replication.shards = await Promise.all(shards.map(async shard => {
        const port = shard.port || 27018
        const shardServerClient = await new MongoConfigurator(shard.hosts, port).init()
        return shardServerClient.tasks.replication.health(shard)
      }))
    } catch (error) {
      logger.error('Error during shard server healthcheck')
      console.error(error)
    }

    // Get sharding status
    const mongosClient = await new MongoConfigurator(config.mongos.host, config.mongos.port || 27017).init()
    status.sharding = await mongosClient.tasks.sharding.health()
  }
  return status
}

module.exports = geatherHealth
