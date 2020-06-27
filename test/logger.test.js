const test = require('ava')
const logger = require('../lib/helpers/logger')

test.serial('logger.info passes logs directly to console.log', (t) => {
  console.log = (...args) => {
    t.is(args[0], 'test1')
    t.is(args[1], 'test2')
    t.is(args[2], 'test3')
  }
  logger.info('test1', 'test2', 'test3')
})

test.serial('logger.debug passes logs directly to console.log', (t) => {
  console.log = (...args) => {
    t.is(args[0], 'debug')
  }
  logger.debug('debug')
})

test.serial('logger.warn passes logs directly to console.log', (t) => {
  console.log = (...args) => {
    t.is(args[0], 'warn')
  }
  logger.warn('warn')
})

test.serial('logger.error passes logs directly to console.log', (t) => {
  console.log = (...args) => {
    t.is(args[0], 'error')
  }
  logger.error('error')
})
