const ReplicationCommands = require('../commands/replication-commands')

// Direct mappings to https://docs.mongodb.com/manual/reference/replica-states/
const SERVER_REPLICATION_STATUS = {
  UNINITIALIZED: -1, // custom hydra state
  STARTUP: 0,
  PRIMARY: 1,
  SECONDARY: 2,
  RECOVERING: 3,
  STARTUP2: 5,
  UNKNOWN: 6,
  ARBITER: 7,
  DOWN: 8,
  ROLLBACK: 9
}

class MongoServerState {
  constructor(hostname, client) {
    this.client = client
    this.hostname = hostname
    this.replicationStatus = SERVER_REPLICATION_STATUS.UNKNOWN
  }

  async refreshState() {
    const replicationCommands = new ReplicationCommands(this.client)
    let status

    try {
      status = await replicationCommands.status()
    } catch (error) {
      if (!error.code) throw error // Not a MongoError, cannot handle this
      status = error
    }

    if (status.code && status.code === 94) {
      this.replicationStatus = SERVER_REPLICATION_STATUS.UNINITIALIZED
      return
    }

    if (status.code) { throw status } // Cannot handle this code

    if (status.myState !== undefined) {
      this.replicationStatus = status.myState
      return
    }

    throw new Error(`Unknown state of replica member: ${JSON.stringify(status)}`)
  }
}

module.exports = { MongoServerState, SERVER_REPLICATION_STATUS }
