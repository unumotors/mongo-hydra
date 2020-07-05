const test = require('ava')
const yargs = require('yargs')
const proxyquire = require('proxyquire')
const Joi = require('@hapi/joi')
const { REPLICA_SET_STATUS } = require('../../lib/core/state/replication')

let foo = {}
let replicaSetStatus = null

let applyFn = {}
let disconnectFn = {}
//
class ReplicaSetState {
  constructor(params) {
    foo = params
    this.replicaSetStatus = replicaSetStatus
  }

  // eslint-disable-next-line class-methods-use-this,require-await
  async apply(...args) {
    return applyFn(...args)
  }

  // eslint-disable-next-line class-methods-use-this,require-await
  async disconnect(...args) {
    return disconnectFn(...args)
  }
}

const replicationCmd = proxyquire('../../lib/cli/replication', {
  '../core/state/replication': {
    ReplicaSetState
  }
})

test.serial('returns help output', (t) => {
  t.plan(1)
  // Initialize parser using the command module
  const parser = yargs.command(replicationCmd).help()

  // Run the command module with --help as argument
  parser.parse('--help', (err, argv, out) => {
    // Just test that the help text contains replication
    t.regex(out, /Sets up replication/)
  })
})

test.serial('parses replica members', (t) => {
  t.plan(1)
  // Initialize parser using the command module
  const parser = yargs.command(replicationCmd).help()

  // Run the command module with --help as argument
  parser.parse('-r=mongo-0:27017 -r=mongo-1:27017 -r=mongo-1:27017', (err, argv) => {
    // Just test that the help text contains replication
    t.deepEqual(argv.r, ['mongo-0:27017', 'mongo-1:27017', 'mongo-1:27017'])
  })
})

test('Throws error with no config', async (t) => {
  await t.throwsAsync(async () => {
    await replicationCmd.handler()
  })
})

test.serial('Calls replication with correct params', async (t) => {
  t.plan(3)
  applyFn = () => {
    t.pass()
  }

  disconnectFn = () => {
    t.pass()
  }
  replicaSetStatus = REPLICA_SET_STATUS.HEALTHY
  const argv = {
    replicaSet: {
      replicaSetName: 'asdf',
      servers: [{ host: 'host:1' }]
    }
  }

  await replicationCmd.handler(argv)
  t.deepEqual(argv.replicaSet, foo)
})

test.serial('Fails when replica isn\'t healthy', async (t) => {
  t.plan(3)
  applyFn = () => {
    t.pass()
  }

  disconnectFn = () => {
    t.pass()
  }
  replicaSetStatus = REPLICA_SET_STATUS.UNINITIALIZED
  const argv = {
    replicaSet: {
      replicaSetName: 'asdf',
      servers: [{ host: 'host:1' }]
    }
  }

  await t.throwsAsync(async () => {
    await replicationCmd.handler(argv)
  }, { message: 'ReplicaSet not healthy. Has state 94' })
})

test.serial('Fails when validation fails', async (t) => {
  t.plan(1)

  const argv = {
    replicaSet: {
      replicaSetName: 'asdf',
      servers: [] // This should contain a host
    }
  }

  await t.throwsAsync(async () => {
    await replicationCmd.handler(argv)
  }, { instanceOf: Joi.ValidationError })
})
