# Replication Example

This example shows off how to use mongo-hydra to configure replication with a basic 3 node replica set

## Requirements

* Docker
* Docker compose
* node >= 10
* npm
* openssl

### Steps

1. Start instances `docker-compose up`
2. Run hydra `hydra replication -f hydra.yaml`

You now have a 3 node mongo replica set!

```sh
mongo --ssl --sslPEMKeyFile ./certs/client/client.pem --sslCAFile ./certs/ca/ca.crt --sslAllowInvalidHostnames  --port 27017 --host localhost  --sslAllowInvalidCertificates
```
