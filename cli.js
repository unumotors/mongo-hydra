#!/usr/bin/env node
const yargs = require('yargs')
const replication = require('./lib/cli/replication')

// This seems required to parse
// eslint-disable-next-line no-unused-vars
const { argv } = yargs
  .command(replication)
  .demandCommand()
  .help()
  // Disable wrapping
  .wrap(null)
  .epilog('Hail Hydra\ncopyright 2020 unu GmbH')
