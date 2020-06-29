# mongo-hydra

[![codecov](https://codecov.io/gh/unumotors/mongo-hydra/branch/master/graph/badge.svg)](https://codecov.io/gh/unumotors/mongo-hydra) [![build](https://github.com/unumotors/mongo-hydra/workflows/Node.js%20CI/badge.svg)](https://github.com/unumotors/mongo-hydra/actions)

A open source mongo orchestration tool with high hopes.

## Vision

Automate the creation, modification, or deletion of everything required to run a highly available scalable mongo cluster.

**Reliability** Highly available, self healing, resistant to failure, scalable leveraging existing orchestration tools (eg k8s)

**Developer Experience** Infra as code, simple to get started, easy to scale down for local development and experimentation.

At unu we run large mongo clusters. We use homegrown tools to manage these clusters. These tools were originally built in bash and have become hard to maintain.

Mongo-hydra is an attempt to open source all that learning in a proper reuseable maintainable tool that we will use internally too.

## Installation

### CLI

```sh
$ npm install -g mongo-hydra
+ mongo-hydra@latest

hydra replication -f examples/replication/hydra.yaml
```

### Docker Image

```sh
docker pull unumotors/mongo-hydra
```

## Release Schedule

| Version  | Component / Feature                  | Github Milestone                                               |
|----------|--------------------------------------|----------------------------------------------------------------|
| `v0.1.0` | Basic scaffolding + connection logic | [v0.0.1](https://github.com/unumotors/mongo-hydra/milestone/1) |
| `v0.2.0` | Manage replication                   | [v0.2.0](https://github.com/unumotors/mongo-hydra/milestone/2) |
| `v0.3.0` | Sharding                             | [v0.3.0](https://github.com/unumotors/mongo-hydra/milestone/3) |
| `v0.4.0` | User and roles                       | [v0.4.0](https://github.com/unumotors/mongo-hydra/milestone/4) |
| `v0.5.0` | Authentication                       | [v0.5.0](https://github.com/unumotors/mongo-hydra/milestone/5) |
| `v0.6.0` | K8s Operator + CRDs                  | [v0.6.0](https://github.com/unumotors/mongo-hydra/milestone/6) |

## Comparison

Similar tools like [KubeDB](https://kubedb.com/docs/0.9.0/concepts/databases/mongodb/) and [Percona Kubernetes Operator](https://www.percona.com/doc/kubernetes-operator-for-psmongodb/index.html) exist. This lists their current feature set.

|                 |                       | Hydra     |KubeDB         | Percona    |
|-----------------|-----------------------|-----------|--------------|------------|
| Interface       | CLI                   | ✅        | ⛔           | ⛔         |
|                 | Raw Machines          | ✅        | ⛔           | ⛔         |
|                 | Docker Standalone     | ✅        | ⛔           | ⛔         |
|                 | k8s operator          | ⛔        | ✅           | ✅         |
| MongoDB support | Replica sets          | ✅        | ✅           | ✅         |
|                 | Delayed members       | ⛔        | ⛔           | ⛔         |
|                 | Arbiter members       | ⛔        | ⛔           | ✅         |
|                 | Sharded cluster       | ⛔        | ⛔           | ⛔         |
|                 | User management       | ⛔        | ⛔           | ⛔         |
|                 | Admin user setup      | ⛔        | ✅ (k8s)     | ✅(k8s)    |
|                 | Mongo version support | ✅ =<4.4| 🟠 3.6       | ✅ 4.2     |
| Security        | Certificates          | ⛔        | ⛔           | ✅         |
|                 | Keyfiles              | ⛔        | ✅           | ⛔         |
|                 | Encryption at rest    | ⛔        | ⛔           | ✅         |
| Backups         | Automatic backups     | ⛔        | ✅           | ✅         |
|                 | s3                    | ⛔        | ✅           | ✅         |
|                 | gcs                   | ⛔        | ✅           | ⛔         |
|                 | tarsnap               | ⛔        | ⛔           | ⛔         |
| Monitoring      | Prometheus            | ⛔        | ✅           | ⛔         |
|                 | Custom                | ⛔        | ⛔           | ✅         |
| Various         | Documentation         | 🟠 Limited| ✅           | 🟠 Limited |

## Warning

Right now this project is pre alpha and **not recommended for production systems.**

## Tests

This project is supported by unit and integration level tests.

To run the unit-tests you need to provide a mongod instance without auth at localhost and run `npm run test-dev`.

To run integration tests you need to run `MONGO_VERSION=4.0 docker-compose -f test-integration/docker-compose.yaml up` and `npm run test-integration`.

## Community & Contributions

Although we will gladly welcome contributions in the near future we would like to first get our first minimal release as we need to aim to maintain feature parity with our internal tool, before opening it up to external contributions.

**Questions and feedback:** [file an issue](https://github.com/unumotors/mongo-hydra/issues).

**Follow along:** [Github Releases](https://github.com/unumotors/mongo-hydra/releases).

## License

Copyright 2020 unu GmbH

Licensed under [MIT](LICENSE)
