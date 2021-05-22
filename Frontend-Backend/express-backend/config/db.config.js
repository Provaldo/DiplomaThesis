module.exports = {
  // HOST: "localhost",
  HOST: "mongodb", // this is the ip of the mongodb container
  // HOST: "172.17.0.1", // this is the ip of the gateway of containers
  // HOST: process.env.
  PORT: 27017,
  DB: "test2",
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_SERVER: process.env.DB_SERVER,
};
