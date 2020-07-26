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

### Connect as cluster member

```sh
mongo --ssl --sslPEMKeyFile ./certs/server/mongodb.pem --sslCAFile ./certs/ca/ca.crt --sslAllowInvalidHostnames --authenticationDatabase='$external' --authenticationMechanism=MONGODB-X509  --port 27017 --host localhost  --sslAllowInvalidCertificates
```

### add client user

```sh
db.getSiblingDB('$external').runCommand(
    {
      createUser: "CN=localhost,OU=Clients,O=hydra",
      roles: [
             { role: "readWrite", db: 'test' },
             { role: "userAdminAnyDatabase", db: "admin" },
             { role: "clusterAdmin", db:"admin" },
             { role: "root", db:"admin" }
           ]
    }
)
```

### Connect as client

```sh
mongo --ssl --sslPEMKeyFile ./certs/client/client.pem --sslCAFile ./certs/ca/ca.crt --sslAllowInvalidHostnames --authenticationMechanism=MONGODB-X509 --authenticationDatabase='$external' --port 27017 --host localhost  --sslAllowInvalidCertificates
```
