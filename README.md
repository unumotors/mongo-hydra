# mongo-hydra

A open source mongo orchestration tool with high hopes.

## Vision

Automate the creation, modification, or deletion of everything required to run a highly available scalable mongo cluster.

**Reliability** Highly available, self healing, resistant to failure, scalable leveraging existing orchestration tools (eg k8s)

**Developer Experience** Infra as code, simple to get started, easy to scale down for local development and experimentation.

At unu we run large mongo clusters. We use homegrown tools to manage these clusters. These tools were originally built in bash and have become hard to maintain.

Mongo-hydra is an attempt to open source all that learning in a proper reuseable maintainable tool that we will use internally too.

## Release Schedule

|Version |  Component / Feature                | Github Milestone                   |
|--------|-------------------------------------| -------------------------------------------------------------- |
|`v0.0.1`| Basic scaffolding + connection logic| [v0.0.1](https://github.com/unumotors/mongo-hydra/milestone/1) |
|`v0.0.2`| Manage replication                  | [v0.0.2](https://github.com/unumotors/mongo-hydra/milestone/2) |
|`v0.0.3`| Sharding                            | [v0.0.3](https://github.com/unumotors/mongo-hydra/milestone/3) |
|`v0.0.4`| User and roles                      | [v0.0.4](https://github.com/unumotors/mongo-hydra/milestone/4) |
|`v0.0.5`| Authentication                      | [v0.0.5](https://github.com/unumotors/mongo-hydra/milestone/5) |
|`v0.0.6`| K8s Operator + CRDs                 | [v0.0.6](https://github.com/unumotors/mongo-hydra/milestone/6) |

## Warning

Right now this project is pre alpha and **not recommended for production systems.**

## Community & Contributions

Although we will gladly welcome contributions in the near future we would like to first get our first minimal release as we need to aim to maintain feature parity with our internal tool, before opening it up to external contributions.

**Questions and feedback:** [file an issue](https://github.com/unumotors/mongo-hydra/issues).

**Follow along:** [Github Releases](https://github.com/unumotors/mongo-hydra/releases).

## License

Copyright 2020 unu GmbH

Licensed under [MIT](LICENSE)
