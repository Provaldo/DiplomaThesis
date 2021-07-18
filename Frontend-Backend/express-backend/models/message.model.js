const mongoose = require("mongoose");

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    // userRef: String, // if each user has their own DB then this field isn't needed.
    consumerRef: String,
    consumerName: String,
    content: String,
    number: Number,
    topic: String,
    receivedAt: Date,
  })
);

module.exports = Message;
