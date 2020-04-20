const { createTerminus } = require('@godaddy/terminus')
const http = require('http')

let options = {
  healthChecks: {},
  signals: [
    'SIGHUP', 'SIGINT', 'SIGTERM', 'SIGUSR2' // SIGUSR2 = Nodemon signal
  ]
}

createTerminus(
  http.createServer(() => {}).listen(process.env.MONITORING_PORT || 8080),
  options
)
