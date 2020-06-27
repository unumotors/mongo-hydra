exports.command = 'replication [-r=mongo-1:27017]'

exports.describe = 'Sets up replication against a basic replica set'

exports.builder = {
  replica: {
    alias: 'r'
  }
}

exports.handler = (argv) => {
  console.log(argv)
}
