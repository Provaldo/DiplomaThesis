const rmqConfig = require("../config/rmq.config");
const db = require("../models");
const Message = db.message;

exports.recordMessage = (condition, msg, messageCount) => {
  const message = new Message({
    consumerName: rmqConfig.RMQ_CONSUMER_NAME,
    exchangeName: rmqConfig.RMQ_EXCHANGE_NAME,
    queueName: rmqConfig.RMQ_QUEUE_NAME,
    content: JSON.parse(msg.content.toString()),
    serialNumber: messageCount,
    topic: rmqConfig.RMQ_ROUTING_KEY, // THIS COULD BE REPLACED BY SOMETHING ELSE THAT WOULD LOG THE ACTUAL TOPIC OF THE SENT MESSAGE AND NOT THE ROUTING KEY
    createdAt: msg.properties.timestamp,
    receivedAt: Date.now(),
    conditionMet: condition,
  });

  message.save((err, message) => {
    if (err) {
      console.log("An error occurred while saving a message to the DB: ", err);
      return -1;
    } else {
      console.log("Message saved successfully to the DB. msg: ", message);
      return 1;
    }
  });
};
