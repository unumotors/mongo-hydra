/* eslint no-await-in-loop: 0 */

const retry = require('../../helpers/retry')
const logger = require('winston')

class Replication {
  constructor(client) {
    this.client = client
  }

  /**
   * Checks if current servers replica set is healthy
   */
  async isHealthy() {
    const healthStatus = await this.health()
    return healthStatus.ok
  }

  /**
   * Checks if current servers replica set is healthy
   */
  async health() {
    const summary = {
      hostnames: this.client.hostnames,
      problems: [],
      ok: true,
      members: {
        count: 0,
        hasPrimary: false
      }
    }
    const status = await this.client.commands.rs.status()
    // Replied back without a error
    if (status.code) {
      summary.error = `Unable to get status ${status.errmsg}`
      return summary
    }
    // Has at least 1 member
    if (!status.members || status.members.length == 0) {
      summary.error = 'Replica set has no members'
      summary.ok = false
      return summary // Has no members
    }
    summary.members.count = status.members.length

    // Check if all members are past startup
    status.members.forEach(member => {
      if (member.state == 1) {
        summary.members.hasPrimary = true
      } else if (member.state != 2 || member.state != 7) {
        summary.problems.push(`Member ${member.name} is in state ${member.stateStr} (${member.state})`)
      }
    })
    // Check if they have at least one primary
    if (!summary.members.hasPrimary) summary.ok = false

    if (!status.ok) {
      summary.ok = false
      summary.error = `Replica set is not ok.`
      summary.info = status
    }

    return summary
  }


  async isInitiated() {
    const status = await this.client.commands.rs.status(false)
    if (status.code) return false // Returned error
    if (status.set) return true
    return false
  }

  /**
   * Checks if replica set initalized and if not tries to initialize it.
   *
   * @param {string} name Replica set name
   * @param {string[]} hostnames Replica set hostnames array
   * @param {Number} port Port of replica set
   */
  async initiate(name, hostnames, port) {
    try {
      logger.info(`Initiating replica set ${name}`)
      // Initialized
      await retry(async() => {
        // Initiate
        const initiationStatus = await this.client.commands.rs.initiate(name, hostnames, port)
        if (initiationStatus.code == 23) return // 23 = Already initialized;
        if (initiationStatus.code == 74) throw new Error('Node not found', initiationStatus) // Node not found cant be helped
        // Check status
        const status = await this.client.commands.rs.status()
        if (!status.code || status.code != 74 && status.ok == 1) { // 74 = NodeNotFound;
          return
        }
        // If we ever get here, it is not able to initialize
        throw new Error('Not able to initiate replica set')
      })
      // Wait for election
      logger.info('Checking if all members are healthy...')
      await retry(async() => {
        if (!await this.isHealthy()) throw new Error('Unhealthy replica set')
      })
      logger.info('Replica set was initiated.')
    } catch (error) {
      logger.error('ERROR DURING REPLICASET INITIATE')
      console.log(error)
    }
  }

  /**
   * Adds a member to the current connections replica set
   *
   * @param {string} hostWithPort e.g. mongodb:27018
   */
  async addReplicaMember(hostWithPort) {
    // Add new member with priority 0 and votes 0; See https://docs.mongodb.com/manual/tutorial/expand-replica-set/
    let config = await this.client.commands.rs.conf()
    config.members.push({
      _id: config.members[config.members.length - 1]._id + 1,
      host: hostWithPort,
      priority: 0,
      votes: 0
    })
    config.version++ // Increase config version
    await this.client.commands.rs.reconfig(config)

    // Wait until it becomes a secondary
    await retry(async() => {
      if (!await this.isHealthy()) throw new Error('Unhealthy replica set after adding replica member')
    })
    // Find newly added member
    const status = await this.client.commands.rs.status()
    const newlyAddedMemberIndex = status.members.findIndex(member => member.name == hostWithPort)
    if (newlyAddedMemberIndex == -1) {
      throw new Error(`Was not able to find newly added replica set member ${hostWithPort} in replica set`)
    }
    // Reconfig it to have votes and priority of 1
    config = await this.client.commands.rs.conf()
    config.version++
    config.members[newlyAddedMemberIndex].priority = 1
    config.members[newlyAddedMemberIndex].votes = 1
    await this.client.commands.rs.reconfig(config)
  }

  /**
   * Removes a member from the current connections replica set
   *
   * @param {string} hostname e.g. mongodb:27018
   */
  async removeReplicaMember(hostname) {
    let config = await this.client.commands.rs.conf()
    config.members = config.members.filter(member => member.host != hostname)
    config.version++ // Increase config version
    await this.client.commands.rs.reconfig(config)
    // Wait until healthy again
    await retry(async() => {
      if (!await this.isHealthy()) throw new Error('Unhealty replica set after adding replica member')
    })
  }

  /**
   * Check if local config differs from server config
   * Retuns [toBeAdded, toBeRemoved]
   *
   * @param {Object} config should contain hostnames and port
   */
  async compareConfigWithServer(config) {
    const { hostnames, port } = config
    // If healthy check if all hostnames are as described in config
    const status = await this.client.commands.rs.status()
    const replicaSethostnames = status.members.map(member => member.name)
    const desiredSethostnames = hostnames.map(host => `${host}:${port}`)
    const toBeAdded = desiredSethostnames.filter(x => !replicaSethostnames.includes(x))
    const toBeRemoved = replicaSethostnames.filter(x => !desiredSethostnames.includes(x))
    return [toBeAdded, toBeRemoved]
  }

  /**
   * Main function
   *
   * Tries to initialize or adapt a replica set for the passed configuration
   *
   *  @param {Object} cfg { replicaSetName, hostnames, port }
   */
  async apply(config) {
    const { replicaSetName, hostnames, port } = config
    logger.info('')
    logger.info(`**** Replica set ${replicaSetName} on port ${port} will be initialized or adapted with servers ${hostnames}`)
    // If unhealthy try to initialize
    const healthy = await this.isInitiated()
    if (healthy) logger.info(`Replica set ${replicaSetName} already initialized.`)
    if (!healthy) return this.initiate(replicaSetName, hostnames, port)

    // If healty check if needs change
    const [toBeAdded, toBeRemoved] = await this.compareConfigWithServer(config)
    if (toBeAdded.length == 0 && toBeRemoved.length == 0) return logger.info(`Replica set ${replicaSetName} is equal to passed configuration`)

    // Add hostnames
    for (let index = 0; index < toBeAdded.length; index++) {
      const hostToAdd = toBeAdded[index]
      logger.info(`Adding host ${hostToAdd} to replica set ${replicaSetName}`)
      try {
        await this.addReplicaMember(hostToAdd)
      } catch (error) {
        console.log(error)
      }
    }

    // Remove hostnames
    for (let index = 0; index < toBeRemoved.length; index++) {
      const hostToDelete = toBeRemoved[index]
      logger.info(`Removing host ${hostToDelete} to replica set ${replicaSetName}`)
      try {
        await this.removeReplicaMember(hostToDelete)
      } catch (error) {
        logger.error(error.message)
      }
    }

    // Wait for it to get healthy and not have the old servers
    await retry(async() => {
      if (!await this.isHealthy()) throw new Error('Unhealty replica set after adding replica member')
    })

    // Check if it worked and replica set is equal to config
    const [toBeAddedAfter, toBeRemovedAfter] = await this.compareConfigWithServer(config)
    if (toBeAddedAfter.length) throw new Error(`The following hostnames were not added: ${toBeAddedAfter}`)
    if (toBeRemovedAfter.length) throw new Error(`The following hostnames were not removed: ${toBeRemovedAfter}`)

    logger.info(`Replica set ${replicaSetName} now is equal to passed configuration`)
  }
}

module.exports = Replication
