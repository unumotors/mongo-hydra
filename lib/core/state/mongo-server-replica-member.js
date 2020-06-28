const MongoServerState = require('./mongo-server')
const ReplicationCommands = require('../commands/replication-commands')
const { SERVER_REPLICATION_STATUS } = require('../helpers/enums')

class ReplicaMemberMongoServerState extends MongoServerState {
  /**
   *
   * @param {Object} settings Settings
   * @param {String} settings.host host used internally by mongo to resolve
   * @param {String} [settings.uri] host overwrite used by hydra to resolve
   * @param {*} client MongoClient overwrite for stubs
   */
  constructor(settings) {
    super(settings)
    // Defaults
    this.replicationStatus = SERVER_REPLICATION_STATUS.UNKNOWN
  }

  async updateReplicationState() {
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

module.exports = ReplicaMemberMongoServerState
