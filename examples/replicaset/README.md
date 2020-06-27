# Replicaset example

Create base replica configuration and then set it up

Setup every thing

```sh
 docker-compose up
```

Manual step if you aren't using hydra to setup the db

```sh
 docker-compose exec mongo-hydra  mongo rs-0:27017 --eval='rs.initiate( {  _id : "rs", members: [{ _id: 0, host: "rs-0:27017" },{ _id: 1, host: "rs-1:27017" },{ _id: 2, host: "rs-2:27017" }]})'
```

Open your browser http://localhost:3000/
