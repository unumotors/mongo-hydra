// Direct mappings to https://docs.mongodb.com/manual/reference/replica-states/
const SERVER_REPLICATION_STATUS = {
  UNINITIALIZED: -1, // custom hydra state
  STARTUP: 0,
  PRIMARY: 1,
  SECONDARY: 2,
  RECOVERING: 3,
  STARTUP2: 5,
  UNKNOWN: 6,
  ARBITER: 7,
  DOWN: 8,
  ROLLBACK: 9
}

const REPLICA_SET_STATUS = {
  UNKNOWN: -1,
  UNINITIALIZED: 94, // Mapping to MongoError code
  HEALTHY: 1
}

module.exports = {
  REPLICA_SET_STATUS,
  SERVER_REPLICATION_STATUS
}
