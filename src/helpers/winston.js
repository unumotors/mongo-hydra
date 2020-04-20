const winston = require('winston')

const { format, transports } = winston
const settings = require('../config/settings')

winston.configure({
  level: process.env.LOGGING_LEVEL || settings.hydra.defaultLoggingLevel,
  format: format.combine(
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  ]
})
