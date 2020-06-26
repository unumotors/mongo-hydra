class MongoClientStub {
  constructor(replies) {
    this.replies = replies
    this.i = 0
    this.commands = []
  }

  async connect() {
    this.db = 'admin'
  }

  async useDatabase(database) {
    this.db = database
  }

  async command(command) {
    const reply = this.replies[this.i]
    this.i++
    this.commands.push(command)
    return reply
  }

  getLastCommand() {
    return this.commands[this.commands.length - 1]
  }
}

module.exports = MongoClientStub
