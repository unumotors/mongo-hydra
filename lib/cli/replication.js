const { ReplicaSetState, REPLICA_SET_STATUS } = require('../core/state/replication')
const logger = require('../helpers/logger')

exports.command = 'replication'

exports.describe = 'Sets up replication against a basic replica set'

exports.builder = {
}

exports.handler = async (argv) => {
  logger.debug('Setting up replication')
  const { replicaSet } = argv
  const state = new ReplicaSetState(replicaSet)
  await state.apply()

  await state.disconnect()
  if (state.replicaSetStatus === REPLICA_SET_STATUS.HEALTHY) {
    logger.info('+ ReplicaSet status is healthy')
  } else {
    logger.warn('- ReplicaSet status not healthy')
    // this will cause an exit code
    throw new Error(`ReplicaSet not healthy. Has state ${state.replicaSetStatus}`)
  }
}
