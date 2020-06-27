class MongoClientStub {
  constructor(replies) {
    this.replies = replies
    this.i = 0
    this.commands = []
  }

  connect() {
    this.db = 'admin'
  }

  useDatabase(database) {
    this.db = database
  }

  command(command) {
    const reply = this.replies[this.i]
    this.i += 1
    this.commands.push(command)
    return reply
  }

  getLastCommand() {
    return this.commands[this.commands.length - 1]
  }
}

module.exports = MongoClientStub
