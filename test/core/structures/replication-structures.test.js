const test = require('ava')
const { ReplicationConfiguration } = require('../../../lib/core/structures/replication-structures')

test('replication configuration structure works as expected for non config servers', (t) => {
  const replicaSetName = 'replica-set-0'
  const hostnames = ['mongod-0:0', 'mongod-1:1', 'mongod-2:2']

  const configuration = new ReplicationConfiguration({
    replicaSetName, hostnames
  })

  t.is(configuration.hostnames, hostnames)
  t.is(configuration.replicaSetName, replicaSetName)

  const mongoConfig = configuration.toMongoConfiguration()
  t.deepEqual(mongoConfig, {
    _id: replicaSetName,
    members: [
      { _id: 0, host: 'mongod-0:0' },
      { _id: 1, host: 'mongod-1:1' },
      { _id: 2, host: 'mongod-2:2' }
    ],
    configsvr: false
  })
})

test('replication configuration structure works as expected for config servers', (t) => {
  const replicaSetName = 'replica-set-0'
  const hostnames = ['mongod-0:0', 'mongod-1:1', 'mongod-2:2']

  const configuration = new ReplicationConfiguration({
    replicaSetName, hostnames, configServer: true
  })

  const mongoConfig = configuration.toMongoConfiguration()
  t.deepEqual(mongoConfig, {
    _id: replicaSetName,
    members: [
      { _id: 0, host: 'mongod-0:0' },
      { _id: 1, host: 'mongod-1:1' },
      { _id: 2, host: 'mongod-2:2' }
    ],
    configsvr: true
  })
})
