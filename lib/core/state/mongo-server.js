const MongoClient = require('../clients/mongodb-client')

class MongoServerState {
  /**
   *
   * @param {Object} settings Settings
   * @param {String} settings.host host used internally by mongo to resolve
   * @param {String} [settings.uri] host overwrite used by hydra to resolve
   * @param {*} client MongoClient overwrite for stubs
   */
  constructor(settings) {
    // host
    this.host = settings.host // Used internally by mongo
    this.uri = settings.uri || settings.host // Used by hydra
    // Client
    this.client = settings.client || new MongoClient(this.uri)
  }
}

module.exports = MongoServerState
