const mongoose = require("mongoose");

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    consumerName: String,
    exchangeName: String,
    content: Object,
    serialNumber: Number,
    topic: String,
    receivedAt: Date,
    conditionMet: Object,
  })
);

module.exports = Message;
