# mongo-hydra

A open source mongo orchestration tool with high hopes.

## Vision

Automate the creation, modification, or deletion of everything required to run a highly available scalable mongo cluster.

**Reliability** Highly available, self healing, resistant to failure, scalable leveraging existing orchestration tools (eg k8s)

**Developer Experience** Infra as code, simple to get started, easy to scale down for local development and experimentation.

At unu we run large mongo clusters. We use homegrown tools to manage these clusters. These tools were originally built in bash and have become hard to maintain.

Mongo-hydra is an attempt to open source all that learning in a proper reuseable maintainable tool that we will use internally too.

## Release Schedule

| Version  | Component / Feature                  | Github Milestone                                               |
|----------|--------------------------------------|----------------------------------------------------------------|
| `v0.0.1` | Basic scaffolding + connection logic | [v0.0.1](https://github.com/unumotors/mongo-hydra/milestone/1) |
| `v0.0.2` | Manage replication                   | [v0.0.2](https://github.com/unumotors/mongo-hydra/milestone/2) |
| `v0.0.3` | Sharding                             | [v0.0.3](https://github.com/unumotors/mongo-hydra/milestone/3) |
| `v0.0.4` | User and roles                       | [v0.0.4](https://github.com/unumotors/mongo-hydra/milestone/4) |
| `v0.0.5` | Authentication                       | [v0.0.5](https://github.com/unumotors/mongo-hydra/milestone/5) |
| `v0.0.6` | K8s Operator + CRDs                  | [v0.0.6](https://github.com/unumotors/mongo-hydra/milestone/6) |

## Comparison

Similar tools like [KubeDB](https://kubedb.com/docs/0.9.0/concepts/databases/mongodb/) and [Percona Kubernetes Operator](https://www.percona.com/doc/kubernetes-operator-for-psmongodb/index.html) exist. This lists their current feature set.

|                 |                       | KubeDB                | Percona                     |
|-----------------|-----------------------|-----------------------|-----------------------------|
| Interface       | CLI                   | 🟠 k8s resources      | ⛔                           |
|                 | k8s operator          | ✅                     | ✅                           |
| MongoDB support | Replica sets          | ✅                     | ✅                           |
|                 | Delayed members       | ⛔                     | ⛔                           |
|                 | Arbiter members       | ⛔                     | ✅                           |
|                 | Sharded cluster       | ⛔                     | ⛔                           |
|                 | User management       | ⛔                     | ⛔                           |
|                 | Admin user setup      | ✅ k8s secrets         | ✅ k8s secrets               |
|                 | Mongo version support | 🟠 3.6                | ✅ 4.2                       |
| Security        | Certificates          | ⛔                     | ✅                           |
|                 | Keyfiles              | ✅                     | ⛔                           |
|                 | Encryption at rest    | ⛔                     | ✅                           |
| k8s features    | Automatic backups     | ✅ Snapshots (Buckets) | ✅ Percona Backups (Buckets) |
|                 | Monitoring            | ✅ Prometheus          | ✅ Percona Monitoring        |
|                 | Custom persistance    | ✅                     | ✅                           |
| Various         | Documentation         | ✅                     | 🟠 Limited                  |

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
