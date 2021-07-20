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
      id: String,
      deploymentName: String,
      labels: Object,
      podName: String,
      creationTimestamp: Date,
      namespace: String,
      managementAddressNodePort: Number,
      managementAddress: String,
      managementAddressPort: Number,
      managementAddressIP: String,
    },
    consumers: [
      {
        deploymentName: String,
        labels: Object,
        podName: String,
        name: String,
        namespace: String,
        creationTimestamp: Date,
        routingKey: String,
        exchangeName: String,
        loggingConditions: [
          {
            variable: String,
            operator: String,
            value: String,
          },
        ],
      },
    ],
  })
);

module.exports = User;
