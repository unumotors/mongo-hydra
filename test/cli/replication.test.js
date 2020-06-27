const test = require('ava')
const yargs = require('yargs')
const replicationCmd = require('../../lib/cli/replication')

test('returns help output', (t) => {
  t.plan(1)
  // Initialize parser using the command module
  const parser = yargs.command(replicationCmd).help()

  // Run the command module with --help as argument
  parser.parse('--help', (err, argv, out) => {
    // Just test that the help text contains replication
    t.regex(out, /Sets up replication/)
  })
})

test('parses replica members', (t) => {
  t.plan(1)
  // Initialize parser using the command module
  const parser = yargs.command(replicationCmd).help()

  // Run the command module with --help as argument
  parser.parse('-r=mongo-0:27017 -r=mongo-1:27017 -r=mongo-1:27017', (err, argv) => {
    // Just test that the help text contains replication
    t.deepEqual(argv.r, ['mongo-0:27017', 'mongo-1:27017', 'mongo-1:27017'])
  })
})

test('handler works', (t) => {
  t.notThrows(() => {
    replicationCmd.handler()
  })
})
