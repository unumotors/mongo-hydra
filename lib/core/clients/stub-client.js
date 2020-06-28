class MongoClientStub {
  constructor(replies) {
    this.replies = replies
    this.i = 0
    this.commands = []
  }

  // eslint-disable-next-line class-methods-use-this
  connect() {}

  // eslint-disable-next-line class-methods-use-this
  useDatabase() {}

  command(command) {
    const reply = this.replies[this.i]
    if (!reply) throw new Error(`Stubbing error. MongoClientStub is out of replies and does not know how to answer "${JSON.stringify(command)}"`)
    this.i += 1
    this.commands.push(command)
    if (reply instanceof Error) throw reply
    return reply
  }

  getLastCommand() {
    return this.commands[this.commands.length - 1]
  }
}

module.exports = MongoClientStub
