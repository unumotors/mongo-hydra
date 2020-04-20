require('./helpers/winston') // Setup winston
require('./helpers/terminus') // Setup terminus

const ClusterOperator = require('./operators/cluster')
const MongoConfigurator = require('./mongo')

const logger = require('winston')

async function run() {
  logger.info('**** Hail Hydra')

  const configServerOperator = new ClusterOperator()
  await configServerOperator.start()
}

async function applyUserConfig(mongos, config) {
  try {
    const port = mongos.port || 27017
    const mongosClient = await new MongoConfigurator(mongos.host, port).init()
    await mongosClient.tasks.roles.apply(config)
    await mongosClient.tasks.users.apply(config)
  } catch (error) {
    logger.error('Error during user management phase')
    console.log(error)
    process.exit(1)
  }
}

async function applyShardingConfig(mongos, config) {
  try {
    const port = mongos.port || 27017
    const mongosClient = await new MongoConfigurator(mongos.host, port).init()
    await mongosClient.tasks.sharding.applySharding(config)
  } catch (error) {
    logger.error('Error during mongos server phase')
    console.log(error)
    process.exit(1)
  }
}

run().catch(error => {
  console.error(error)
  process.exit(1)
})
