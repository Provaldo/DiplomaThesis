module.exports = {
  RMQ_USERNAME: process.env.RMQ_USERNAME,
  RMQ_PASSWORD: process.env.RMQ_PASSWORD,
  RMQ_SERVER: process.env.RMQ_SERVER,
  RMQ_PORT: process.env.RMQ_PORT,
  // RMQ_PORT: "5672",
  RMQ_CONSUMER_NAME: process.env.RMQ_CONSUMER_NAME,
  RMQ_EXCHANGE_NAME: process.env.RMQ_EXCHANGE_NAME,
  RMQ_ROUTING_KEY: process.env.RMQ_ROUTING_KEY,
  RMQ_LOGGING_CONDITIONS: process.env.RMQ_LOGGING_CONDITIONS,
};