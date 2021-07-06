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
    rabbitmqServer: {
      deploymentName: String,
      labels: Object,
      podName: String,
      creationTimestamp: Date,
      id: String,
      namespace: String,
      managementAddressNodePort: Number,
      managementAddress: String,
    },
    // consumers: [
    //   {
    //     name: String,
    //     createdAt: Date,
    //     id: String,
    //     topic: String,
    //     address: String,
    //   },
    // ],
  })
);

module.exports = User;
