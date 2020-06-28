#!/usr/bin/env node
const yargs = require('yargs')
const fs = require('fs')
const yaml = require('js-yaml')
const replication = require('./lib/cli/replication')

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
    .demandCommand()
    .help()
    // Disable wrapping
    .wrap(null)
    .epilog('Hail Hydra\ncopyright 2020 unu GmbH')
}

try {
  main()
} catch (e) {
  console.log(e)
  throw e
}
