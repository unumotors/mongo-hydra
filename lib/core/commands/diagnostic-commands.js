class DiagnosticCommands {
  constructor(client) {
    this.client = client
  }

  async ping() {
    const command = { ping: 1 }
    return await this.client.command(command)
  }
}

module.exports = DiagnosticCommands
