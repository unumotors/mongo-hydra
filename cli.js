#!/usr/bin/env node
const yargs = require('yargs')
const fs = require('fs')
const yaml = require('js-yaml')
const replication = require('./lib/cli/replication')
const users = require('./lib/cli/users')

// This seems required to parse
async function main() {
  // eslint-disable-next-line no-unused-vars
  const { argv } = await yargs
    .usage('Usage: $0 -c <configfile>')
    // Loads the configuration
    .config('f', 'Configuration file', (filename) => {
      const file = fs.existsSync(filename) ? filename : 'hydra.yaml'
      return yaml.safeLoad(fs.readFileSync(file, 'utf8'))
    })
    .command(replication)
    .command(users)
    .demandCommand()
    .help()
    .fail((msg, err, args) => {
      console.error(msg)
      console.error('')
      console.error(args.help())
      console.error('')
      if (err) throw err // preserve stack
      process.exit(1)
    })
    // Disable wrapping
    .wrap(null)
    .epilog('Hail Hydra\ncopyright 2020 unu GmbH')
    .argv
}

try {
  main()
} catch (e) {
  console.log(e)
  throw e
}
