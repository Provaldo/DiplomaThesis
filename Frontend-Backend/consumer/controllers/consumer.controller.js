const amqp = require("amqplib/callback_api");
const rmqConfig = require("../config/rmq.config");
const consumerConfig = require("../config/consumer.config");
const consumerProcess = require(".../src/consumerProcess");

const dbConfig = require("../config/db.config");
// const MongoClient = require("mongodb").MongoClient;

createProcess = (req, res) => {
  consumerProcess.createConsumerProcess(req.body);
  consumerConfig.NR_OF_CONSUMERS = ++consumerConfig.NR_OF_CONSUMERS;
  console.log("I'm here hehe");
  res.status(200).send({
    id: consumerConfig.NR_OF_CONSUMERS,
    creationTimestamp: Date.now(),
  });
};

const consumerController = {
  createProcess,
};

module.exports = consumerController;
