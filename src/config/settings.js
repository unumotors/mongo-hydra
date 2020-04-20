const settings = {}

// connection options
settings.mongo = {
  sslPEMKeyFile: process.env.HYDRA_SSL_KEY_FILE || `/certs/mongo/mongodb.key`,
  sslPEMCertificateFile: process.env.HYDRA_SSL_CERTIFICATE_FILE || `/certs/mongo/mongodb.crt`,
  sslCaFile: process.env.HYDRA_SSL_CA_FILE || `/certs/ca/ca.crt`
}

settings.hydra = {
  configFolder: process.env.CONFIG_FOLDER || './config/',
  defaultLoggingLevel: process.env.LOGGING_LEVEL || 'info',
  watchConfigFolder: process.env.DISABLE_WATCH == undefined,
  signalHealth: process.env.SIGNAL_HEALTH_ENABLED,
  healthPort: process.env.SIGNAL_HEALTH_PORT || 4000
}

settings.userManagement = {
  addUsers: process.env.UPDATE_USERS || true,
  updateUsers: process.env.UPDATE_USERS || true,
  removeUsers: process.env.REMOVE_USERS_DANGEROUS != undefined,
  removeRoles: process.env.REMOVE_ROLES_DANGEROUS != undefined
}

module.exports = settings
