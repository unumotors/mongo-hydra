const { ResourceEventType, default: Operator } = require('@dot-i/k8s-operator')
const Path = require('path')
const logger = require('winston')
const MongoConfigurator = require('../mongo')

class ConfigServerOperator extends Operator {
  constructor() {
    super(logger)
  }

  async init() {
    const crdFile = Path.resolve(__dirname, '../../crd', 'cluster.mongo-hydra.io.yaml')
    const { group, versions, plural } = await this.registerCustomResourceDefinition(crdFile)
    await this.watchResource(group, versions[0].name, plural, async(event) => {
      try {
        if (event.type === ResourceEventType.Added || event.type === ResourceEventType.Modified) {
          await this.resourceModified(event)
        } else {
          logger.warning('Unhandled event type ', event.type)
        }
      } catch (err) {
        console.log(err)
      }
    })
  }

  async resourceModified(event) {
    const { object } = event
    const { spec, metadata } = object

    logger.info(`[${metadata.name}] Initializing cluster "${metadata.name}"`)

    const { configServer, shards, mongos } = spec
    try {
      // Init config servers
      if (!configServer.port) configServer.port = 27019
      const configServerClient = await new MongoConfigurator(configServer.hostnames, configServer.port).init()
      await configServerClient.tasks.replication.apply(configServer)
      logger.info(`[${metadata.name}] Successfully initialized config servers`)

      // Initialize all shard
      await Promise.all(shards.map(async shard => {
        if (!shard.port) shard.port = 27018
        const shardServerClient = await new MongoConfigurator(shard.hostnames, shard.port).init()
        await shardServerClient.tasks.replication.apply(shard)
        logger.info(`[${metadata.name}] Successfully initialized shard ${shard.replicaSetName}`)
      }))
      logger.info(`[${metadata.name}] All shards successfully initialized`)

      // Connect to mongos and add shards to cluster
      if (!mongos.port) mongos.port = 27017
      const mongosClient = await new MongoConfigurator(mongos.hostname, mongos.port).init()
      // Add all shards
      if (shards) await mongosClient.tasks.sharding.addShards(shards)
      logger.info(`[${metadata.name}] Succesfully added shards`)
    } catch (error) {
      logger.error(error)
      logger.error(`[${metadata.name}] Unable to initialize cluster`)
    }
    logger.info(`[${metadata.name}] Successfully initalized cluster`)
  }
}

module.exports = ConfigServerOperator
