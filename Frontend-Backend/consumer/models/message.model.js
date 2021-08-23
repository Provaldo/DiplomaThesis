const mongoose = require("mongoose");

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    consumerName: String,
    exchangeName: String,
    queueName: String,
    content: Object,
    serialNumber: Number,
    topic: String,
    createdAt: Date,
    receivedAt: Date,
    conditionMet: Object,
  })
);

module.exports = Message;
