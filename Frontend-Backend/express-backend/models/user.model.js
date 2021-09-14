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
        queueName: String,
        loggingConditions: [
          {
            variable: String,
            operator: String,
            value: String,
          },
        ],
      },
    ],
    overviewData: {
      DBdata: {
        timeframeNumberOfMessages: Number,
        timeframeMessageInsertRate: Number,
        totalNumberOfMessages: Number,
      },
      msgsRcvdByExchanges: Number,
      msgsRoutedByExchanges: Number,
      incomingMsgRateToExchanges: [
        {
          exchangeName: String,
          avgValue: Number,
          avgRate: Number,
        },
      ],
      bytesOfMsgsInQueues: Number,
      msgsDeliveredToConsumersByActiveQueues: Number,
      msgsAcknowledged: {
        totalMsgs: Number,
        avgValue: Number,
        avgRate: Number,
      },
      msgsDeliveredToConsumers: {
        totalMsgs: Number,
        avgValue: Number,
        avgRate: Number,
      },
      msgsDroppedAsUnroutable: {
        totalMsgs: Number,
        avgValue: Number,
        avgRate: Number,
      },
      msgsPublished: {
        totalMsgs: Number,
        avgValue: Number,
        avgRate: Number,
      },
      msgsInQueues: {
        totalMsgs: Number,
        avgValue: Number,
        avgRate: Number,
      },
      numberOfConsumers: Number,
      numberOfExchanges: Number,
      numberOfQueues: Number,
    },
  })
);

module.exports = User;
