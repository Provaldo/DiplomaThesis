const mongoose = require("mongoose");

const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
    {
      consumerName: String,
      exchangeName: String,
      queueName: String,
      content: Object,
      serialNumber: Number,
      topic: String,
      producedAt: Number,
      receivedAt: Number,
      conditionMet: Object,
    },
    {
      timestamps: true,
    }
  )
);

module.exports = Message;
