const mongoose = require("mongoose");

const Consumer = mongoose.model(
  "Consumer",
  new mongoose.Schema({
    name: String,
    // userRef: String, // if each user has their own DB then this field isn't needed.
    createdAt: Date,
    topic: String,
    address: String, // if all the consumers are produced in a single container this isn't needed. otherwise it is.
  })
);

module.exports = Consumer;
