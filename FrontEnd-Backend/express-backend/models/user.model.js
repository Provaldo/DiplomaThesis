const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    rabbitmqServers: [
      {
        name: String,
        createdAt: Date,
        id: String,
      },
    ], //not sure about the rabbitmwServers object if it's needed
    consumers: [
      {
        name: String,
        createdAt: Date,
        id: String,
        topic: String,
      },
    ],
  })
);

module.exports = User;
