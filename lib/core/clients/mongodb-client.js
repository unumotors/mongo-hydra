const mongodb = require('mongodb')

class MongoClient {
  constructor(uri, options) {
    const defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
    this.options = { ...defaultOptions, ...options }
    this.uri = uri
    this.connected = false
  }

  async connect() {
    if (this.connected) return
    this.client = await mongodb.MongoClient.connect(this.uri, this.options)
    this.useDatabase('admin')
  }

  useDatabase(database) {
    this.db = this.client.db(database)
  }

  async command(command) {
    if (!this.connected) await this.connect()
    return await this.db.command(command)
  }
}

module.exports = MongoClient
