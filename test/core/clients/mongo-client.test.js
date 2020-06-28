const proxyquire = require('proxyquire')
const test = require('ava')

let connectFn = () => {}
let dbFn = () => {}
let closeFn = () => {}
let commandFn = () => {}

const MongoClient = proxyquire('../../../lib/core/clients/mongodb-client', {
  // eslint-disable-next-line quote-props
  'mongodb': {
    MongoClient: {
      async connect(...args) {
        await connectFn(...args)
        return { // Fake MongoClient
          db(database) {
            dbFn(database)
            return {
              command(command) {
                return commandFn(command)
              }
            }
          },
          close() {
            return closeFn()
          }
        }
      }
    }
  }
})

const uri = 'mongodb://test:123'

test.serial('constructor sets defaults', (t) => {
  const extraOptions = { test: 1 }
  const client = new MongoClient(uri, extraOptions)
  t.is(client.options.useNewUrlParser, true)
  t.is(client.options.useUnifiedTopology, true)
  t.is(client.options.test, 1)
})

test.serial('connect() calls with propper arguments and is idempotent', async (t) => {
  t.plan(3)
  const client = new MongoClient(uri)
  connectFn = ((passedUri, passedOptions) => {
    t.is(passedUri, 'mongodb://test:123')
    t.deepEqual(passedOptions, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
  })
  dbFn = (database) => {
    t.is(database, 'admin')
  }
  await client.connect()
  connectFn = (() => {
    t.fail()
  })
  await client.connect()
})

test.serial('disconnect() calls close()', async (t) => {
  t.plan(1)
  const client = new MongoClient(uri)
  await client.connect()
  closeFn = (() => {
    t.pass()
  })
  await client.disconnect()
})

test.serial('command() calls db.command() and lazily connects', async (t) => {
  t.plan(3)
  const client = new MongoClient(uri)
  connectFn = (() => {
    t.pass()
  })
  commandFn = ((command) => {
    t.is(command, 'test')
  })
  await client.command('test')
  await client.command('test')
})
