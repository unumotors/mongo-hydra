const logger = require('winston')
const retry = require('../helpers/retry')
const MongoConnector = require('./connection')

// Supported tasks
const TaskReplicationTasks = require('./tasks/replication')
const ShardingTasks = require('./tasks/sharding')

// Supported commands
const CommandDb = require('./commands/db')
const CommandRs = require('./commands/rs')
const CommandSh = require('./commands/sh')


class MongoConfigurator {
  constructor(hosts, port, connectToMaster = true) {
    this.commands = {}
    this.tasks = {}
    this.connector = new MongoConnector(this, hosts, port, connectToMaster)
  }

  injectTasksAndCommands() {
    this.tasks = {
      replication: new TaskReplicationTasks(this),
      sharding: new ShardingTasks(this)
    }
    this.commands = {
      db: new CommandDb(this),
      sh: new CommandSh(this),
      rs: new CommandRs(this)
    }
  }

  /**
   * Initiates connection
   */
  async init() {
    await retry(async() => {
      await this.connector.getConnection()
      await this.injectTasksAndCommands()
      await this.connector.makeSureConnectedToMaster()
    })

    return this
  }

  /**
   * Use different database
   */
  async useDatabase(database) {
    this.db = this.connector.client.db(database)
  }

  /**
   * Send a command using the current connection
   * @param {Object} command Mongo Database command
   */
  async sendCommand(command, showWarnings = true) {
    if (!this.connector.client || !this.db) throw new Error('No connection initialized yet')
    logger.debug(`**** SENDING COMMAND:\n${JSON.stringify(command)}`)
    let data
    try {
      data = await this.db.command(command)
    } catch (error) {
      data = error
    }
    logger.debug(`**** RECIEVED:\n ${JSON.stringify(data)}`)
    if (data.ok == '0' && showWarnings) logger.warn(data.errmsg)
    return data
  }
}

module.exports = MongoConfigurator
