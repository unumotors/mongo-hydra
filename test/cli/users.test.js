const test = require('ava')
const yargs = require('yargs')
const proxyquire = require('proxyquire')
const SubClient = require('../../lib/core/clients/stub-client')

let stateParams = {}

let applyFn = {}
//
class MongoUsersState {
  constructor(params) {
    stateParams = params
  }

  // eslint-disable-next-line class-methods-use-this,require-await
  async apply(...args) {
    return applyFn(...args)
  }
}

const usersCmd = proxyquire('../../lib/cli/users', {
  '../core/state/mongo-users-state': MongoUsersState,
  '../core/clients/mongodb-client': SubClient
})

test.serial('returns help output', (t) => {
  t.plan(1)
  // Initialize parser using the command module
  const parser = yargs.command(usersCmd).help()

  // Run the command module with --help as argument
  parser.parse('--help', (err, argv, out) => {
    // Just test that the help text contains replication
    t.regex(out, /Sets up users/)
  })
})

test('Throws error with no config', async (t) => {
  await t.throwsAsync(async () => {
    await usersCmd.handler()
  })
})

test.serial('Calls replication with correct params', async (t) => {
  t.plan(2)
  applyFn = () => {
    t.pass()
  }

  const argv = {
    connection: {
      uri: 'mongo://doesntmatter'
    },
    users: [
      {
        user: 'david',
        password: 'password'
      }
    ]
  }

  await usersCmd.handler(argv)
  t.deepEqual(stateParams.users, argv.users)
})
