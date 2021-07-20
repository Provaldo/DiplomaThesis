const rmqConfig = require("../config/rmq.config");
const db = require("../models");
const Message = db.message;

exports.recordMessage = (condition, msg, messageCount) => {
  const message = new Message({
    consumerName: rmqConfig.RMQ_CONSUMER_NAME,
    exchangeName: rmqConfig.RMQ_EXCHANGE_NAME,
    content: JSON.parse(msg.content.toString()),
    serialNumber: messageCount,
    topic: "",
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
