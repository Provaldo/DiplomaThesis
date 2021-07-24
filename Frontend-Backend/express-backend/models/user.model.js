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
      addressIP: String,
      managementAddressNodePort: Number,
      managementAddressPort: Number,
      managementAddressPortName: String,
      amqpAddressNodePort: Number,
      amqpAddressPort: Number,
      amqpAddressPortName: String,
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
