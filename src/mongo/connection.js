var { MongoClient } = require('mongodb')
const fs = require('fs')
const settings = require('../config/settings')
const certificateHelper = require('../helpers/certificates')
const logger = require('winston')

const {
  sslPEMKeyFile, sslPEMCertificateFile, sslCaFile
} = settings.mongo

class MongoConnector {
  constructor(configurator, hosts, port, connectToMaster = true) {
    this.hosts = Array.isArray(hosts) ? hosts : [hosts]
    if (this.hosts.length == 1) {
      // Not able to change to other server, so useless
      connectToMaster = false
    }
    this.connectToMaster = connectToMaster
    this.host = this.hosts[0] // eslint-disable-line prefer-destructuring
    this.port = port
    this.db = 'admin'
    this.configurator = configurator
  }
  /**
   * Initiates the connection
   */
  async getConnection() {
    logger.debug('')
    logger.debug(`**** Opening connection to server ${this.host}:${this.port}`)

    const key = fs.readFileSync(sslPEMKeyFile, 'utf8')
    const crt = fs.readFileSync(sslPEMCertificateFile, 'utf8')
    const ca = fs.readFileSync(sslCaFile, 'utf8')
    const userName = certificateHelper.getSubjectRFC2253FromCertificate(crt)

    this.client = await MongoClient.connect(`mongodb://${this.host}:${this.port}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authMechanism: 'MONGODB-X509',
      authSource: '$external',
      auth: {
        user: userName
      },
      ssl: true,
      sslCA: ca,
      sslKey: key,
      sslCert: crt
    })
    this.configurator.useDatabase('admin')

    return this.client
  }

  /**
   * Closes connection
   */
  async quit() {
    this.client.close()
    this.client = null
    this.db = null
  }

  /**
   * Checks if current connection is primary. If not, reconnects to primary
   */
  async makeSureConnectedToMaster() {
    if (this.connectToMaster) {
      const status = await this.configurator.commands.db.isMaster()
      if (status.ismaster) return
      if (status.primary == undefined) return logger.info('Replica set has no master. It is probably uninitialized or starting. Running initialization to make sure.')
      this.host = status.primary.split(':')[0] // eslint-disable-line prefer-destructuring
      logger.info(`Not connected to primary, will now connect to ${this.host}`)
      await this.quit()
      await this.getConnection()
    }
  }
}

module.exports = MongoConnector
