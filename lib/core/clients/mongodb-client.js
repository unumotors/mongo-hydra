const mongodb = require('mongodb')

class MongoClient {
  constructor(uri, options) {
    const defaultOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
    this.options = { ...defaultOptions, ...options }
    this.uri = uri
  }

  async connect() {
    if (this.client) return
    this.client = await mongodb.MongoClient.connect(this.uri, this.options)
    this.useDatabase('admin')
  }

  async disconnect() {
    return await this.client.close()
  }

  useDatabase(database) {
    this.db = this.client.db(database)
  }

  async command(command) {
    if (!this.client) await this.connect()
    return await this.db.command(command)
  }
}

module.exports = MongoClient
