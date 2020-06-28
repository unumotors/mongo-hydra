const promiseRetry = require('promise-retry')
const ReplicationCommands = require('../commands/replication-commands')
const { SERVER_REPLICATION_STATUS } = require('./mongo-server')
const logger = require('../../helpers/logger')

const REPLICA_SET_STATUS = {
  UNKNOWN: 0,
  UNINITIALIZED: 94,
  HEALTHY: 1
}

class ReplicaSetState {
  constructor(configuration) {
    this.configuration = configuration
  }

  async waitUntilHealthy() {
    await promiseRetry(async (retry, number) => {
      await this.refreshState()
      logger.debug(`${this.configuration.replicaSetName}: (${number}) Waiting for state HEALTHY, found "${this.replicaSetStatus}"`)
      if (this.replicaSetStatus !== REPLICA_SET_STATUS.HEALTHY) {
        retry(new Error(`${this.configuration.replicaSetName}: Replica set did not become healthy`))
      }
    })
  }

  async initialize() {
    logger.debug(`${this.configuration.replicaSetName}: Initializing replica set`)
    // Initiate
    const { client } = this.configuration.servers[0] // Just pick the first for this
    const replicationCommands = new ReplicationCommands(client)
    const mongoConfig = this.configuration.toMongoConfiguration()
    const initiationStatus = await replicationCommands.initiate(mongoConfig)
    if (initiationStatus.ok !== 1) throw new Error(`Failed replica set initiation with: ${JSON.stringify(initiationStatus)}`) // failure
    await this.waitUntilHealthy() // Wait for election to finish
  }

  async apply() {
    await this.refreshState()
    logger.debug(`${this.configuration.replicaSetName}: Replica set in state "${this.replicaSetStatus}"`)

    if (this.replicaSetStatus === REPLICA_SET_STATUS.UNINITIALIZED) {
      await this.initialize()
      return
    }

    if (this.replicaSetStatus === REPLICA_SET_STATUS.HEALTHY) {
      return // TODO: Add/remove members, for now we are happy with this though
    }

    throw new Error(`${this.configuration.replicaSetName}: Replica set status unknown. Cannot apply configuration.`)
  }

  async refreshState() {
    logger.debug(`${this.configuration.replicaSetName}: Refreshing status of replica set`)
    const { servers } = this.configuration

    // First connect to all members
    for (const server of servers) {
      await server.refreshState()
    }

    // Check if none of the servers are intialized
    const allUninitialized = servers.every(
      (server) => server.replicationStatus === SERVER_REPLICATION_STATUS.UNINITIALIZED
    )
    if (allUninitialized) {
      this.replicaSetStatus = REPLICA_SET_STATUS.UNINITIALIZED
      return
    }

    // Check if all of the servers are either a PRIMARY or SECONDARY
    const fullyInitialized = servers.every(
      (server) => server.replicationStatus === SERVER_REPLICATION_STATUS.PRIMARY
        || server.replicationStatus === SERVER_REPLICATION_STATUS.SECONDARY

    )
    if (fullyInitialized) {
      this.replicaSetStatus = REPLICA_SET_STATUS.HEALTHY
      return
    }

    this.replicaSetStatus = REPLICA_SET_STATUS.UNKNOWN
  }
}

module.exports = { ReplicaSetState, REPLICA_SET_STATUS }
