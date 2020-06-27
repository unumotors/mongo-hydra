/**
 * A structure describing a replica set configuration that needs to be passed to
 * MongoDB during replication initiation and reconfiguration
 */
class ReplicationConfiguration {
  constructor({
    replicaSetName,
    hostnames,
    configServer = false
  }) {
    this.replicaSetName = replicaSetName
    this.hostnames = hostnames
    this.configServer = configServer
  }

  /**
   * Returns the configuration in the structure required by the MongoDB commands:
   * - replSetInitiate
   * - replSetReconfig
   */
  toMongoConfiguration() {
    const members = this.hostnames.map((host, index) => ({ _id: index, host }))
    const configuration = {
      _id: this.replicaSetName,
      members
    }
    configuration.configsvr = this.configServer
    return configuration
  }
}

module.exports = {
  ReplicationConfiguration
}
