const promiseRetry = require('promise-retry')
const ReplicationCommands = require('../commands/replication-commands')
const ReplicaMemberMongoServerState = require('./mongo-server-replica-member')
const { REPLICA_SET_STATUS, SERVER_REPLICATION_STATUS } = require('../helpers/enums')
const logger = require('../../helpers/logger')

class ReplicaSetState {
  constructor(settings) {
    this.replicaSetName = settings.replicaSetName
    this.servers = settings.servers.map((server) => new ReplicaMemberMongoServerState(server))
    this.replicaSetStatus = REPLICA_SET_STATUS.UNKNOWN
  }

  async waitUntilHealthy() {
    await promiseRetry(async (retry, number) => {
      await this.refreshState()
      logger.debug(`${this.replicaSetName}: (${number}) Waiting for state HEALTHY, found "${this.replicaSetStatus}"`)
      if (this.replicaSetStatus !== REPLICA_SET_STATUS.HEALTHY) {
        retry(new Error(`${this.replicaSetName}: Replica set did not become healthy`))
      }
    })
  }

  async initialize() {
    logger.debug(`${this.replicaSetName}: Initializing replica set`)
    // Initiate
    const { client } = this.servers[0] // Just pick the first for this
    const replicationCommands = new ReplicationCommands(client)
    const mongoConfig = this.toMongoConfiguration()
    const initiationStatus = await replicationCommands.initiate(mongoConfig)
    if (initiationStatus.ok !== 1) throw new Error(`Failed replica set initiation with: ${JSON.stringify(initiationStatus)}`) // failure
    await this.waitUntilHealthy() // Wait for election to finish
  }

  async apply() {
    await this.refreshState()
    logger.debug(`${this.replicaSetName}: Replica set in state "${this.replicaSetStatus}"`)

    // All states we can handle
    const actions = {
      [REPLICA_SET_STATUS.UNINITIALIZED]: async () => {
        await this.initialize()
      },
      [REPLICA_SET_STATUS.HEALTHY]: async () => {
        // TODO: Add/remove members, for now we are happy with this though
      }
    }

    const action = actions[this.replicaSetStatus]
    if (!action) throw new Error(`${this.replicaSetName}: Replica set status unknown. Cannot apply configuration.`)
    return await action()
  }

  async refreshState() {
    logger.debug(`${this.replicaSetName}: Refreshing status of replica set`)

    // First connect to all members
    for (const server of this.servers) {
      await server.updateReplicationState()
    }

    // Check if none of the servers are intialized
    const allUninitialized = this.servers.every(
      (server) => server.replicationStatus === SERVER_REPLICATION_STATUS.UNINITIALIZED
    )
    if (allUninitialized) {
      this.replicaSetStatus = REPLICA_SET_STATUS.UNINITIALIZED
      return
    }

    // Check if all of the servers are either a PRIMARY or SECONDARY
    const fullyInitialized = this.servers.every(
      (server) => server.replicationStatus === SERVER_REPLICATION_STATUS.PRIMARY
        || server.replicationStatus === SERVER_REPLICATION_STATUS.SECONDARY

    )
    if (fullyInitialized) {
      this.replicaSetStatus = REPLICA_SET_STATUS.HEALTHY
      return
    }

    this.replicaSetStatus = REPLICA_SET_STATUS.UNKNOWN
  }

  /**
   * Returns the configuration in the structure required by the MongoDB commands:
   * - replSetInitiate
   * - replSetReconfig
   */
  toMongoConfiguration() {
    const members = this.servers.map((server, index) => ({ _id: index, host: server.host }))
    const configuration = {
      _id: this.replicaSetName,
      members
    }
    return configuration
  }
}

module.exports = { ReplicaSetState, REPLICA_SET_STATUS }
