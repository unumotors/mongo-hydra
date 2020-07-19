# Contributing Guide

## CLI

In order to make development and testing the CLI tool you can run `npm link` in the project root.

This will allow you to execute the CLI commands as if they were globally installed.

```sh
$ hydra -h
hydra <command>
....
Hail Hydra
copyright 2020 unu GmbH

$ mongo-hydra -h
hydra <command>
....
Hail Hydra
copyright 2020 unu GmbH
```

## Tests

Thee are 2 types of tests `unit` and `integration`.

### unit

These are totally isolated tests that verify logic works as expected, these have to run in total isolation. No external dependencies. All mongo interactions should be stubbed out using our `core/clients/stub-client.js`

### integration

These are tests that  are basic integration tests that test connection to external mongo instances. These must be able to run against multiple mongo versions. This is achieved by multiple jobs in our github actions.
