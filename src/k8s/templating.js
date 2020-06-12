const yaml = require('js-yaml')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

function loadYaml(filename) {
  const f = path.resolve(__dirname, filename)
  return yaml.safeLoad(fs.readFileSync(f, 'utf8'))
}

function createPodDisruptionBudget(config) {
  const manifest = loadYaml('./templates/pod-disruption-budget.yaml')

  // Set namespace
  if (config.namespace) manifest.metadata.namespace = config.namespace

  // Set all naming
  manifest.metadata.name =
  manifest.spec.selector.matchLabels.name =

  config.name

  return manifest
}

function createServiceManifest(config) {
  const manifest = loadYaml('./templates/service.yaml', 'utf8')

  // Set namespace
  if (config.namespace) manifest.metadata.namespace = config.namespace

  // Set name
  manifest.metadata.name =
  manifest.metadata.labels.app =
  manifest.spec.selector.app =
  config.name

  // set cluster name
  manifest.metadata.labels.cluster = config.cluster

  return manifest
}

function createStatefulSet(config) {
  const manifest = loadYaml('./templates/stateful-set.yaml', 'utf8')
  // Set namespace
  if (config.namespace) manifest.metadata.namespace = config.namespace

  // Set name
  manifest.metadata.name =
  manifest.spec.selector.matchLabels.app =
  manifest.spec.serviceName =
  manifest.spec.template.metadata.labels.app =
  manifest.spec.template.spec.containers[0].name =
  config.name

  // Add replica set name command
  manifest.spec.template.spec.containers[0].command.push(...['--replSet', `${config.name}`])
  // Add command determining server type
  manifest.spec.template.spec.containers[0].command.push(...config.commands)

  // Set ports in mongo container
  manifest.spec.template.spec.containers[0].ports[0].containerPort = config.port
  // Replace readiness probe command port in mongo container
  manifest.spec.template.spec.containers[0].readinessProbe.exec.command = [
    '/bin/sh',
    '-c',
    `mongo --port ${config.port} --ssl --sslPEMKeyFile /certs/mongo/mongodb.pem --sslCAFile /certs/ca/ca.crt --sslAllowInvalidHostnames --authenticationMechanism=MONGODB-X509 --authenticationDatabase='$external' --eval "if(rs.status().myState==1||rs.status().myState==2||rs.status().code==94){quit(0)}else{quit(1)}"`
  ]

  // Replace ports in prometheus exporter
  manifest.spec.template.spec.containers[1].env[0].value = config.port
  // Replace CN in prometheus exporter
  manifest.spec.template.spec.containers[1].env[5].value = config.prometheusMongoUri

  const mergedManifest = _.merge(manifest, config.overwrites)
  console.log(JSON.stringify(mergedManifest, null, 2))
  return mergedManifest
}

async function createConfigServer(config) {
  const podDistruptionBudgetManifest = createPodDisruptionBudget(config)
  const serviceManifest = createServiceManifest(config)
  const configServersStatefulSetManifest = createStatefulSet({
    name: config.name,
    namespace: config.namespace,
    overwrites: config.configServer.overwrites,
    commands: ['--configsvr'],
    port: 9000,
    prometheusMongoUri: config.prometheusMongoUri
  })
}


createConfigServer({
  name: 'cfg-test',
  cluster: 'development',
  namespace: 'default',
  prometheusMongoUri: 'mongodb://CN=$(SUBJECT_COMMON_NAME),OU=mongo-cluster,O=development@localhost:$(MONGO_PORT)/?authMechanism=MONGODB-X509',
  configServer: {
    overwrites: {
      spec: {
        replicas: 1,
        volumeClaimTemplates: [{
          spec: {
            resources: {
              requests: {
                storage: '1Gi'
              }
            }
          }
        }],
        template: {
          spec: {
            containers: [{
              resources: {
                limits: {
                  memory: '1Gi'
                },
                requests: {
                  memory: '1Gi'
                }
              }
            }]
          }
        }
      }
    }
  }
})
