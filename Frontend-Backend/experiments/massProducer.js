#!/usr/bin/env node
var amqp = require("amqplib/callback_api");
const fetch = require("node-fetch");

var username = "mple";
var password = "123456";
var RMQServerIP = "10.106.43.203";

var exchangeName = "test";
var routingKey = "temp.dist.severity";
// var msg = { temp: 20, distance: 1000, severity: "critical" };

var msgPublishRate = 100; // messages per second
var experimentDuration = 30; // how long the producer should publish messages for

const dataTimeframeInSecs = "6";
const dataIntervalsInSecs = "1";

// var args = process.argv.slice(2);

// if (args.length == 0) {
//   console.log(
//     "Usage: receive_logs_topic.js <topic> or <property> or <property> <value>"
//   );
//   process.exit(1);
// }

amqp.connect(
  // "amqp://guest:guest@rabbitmq:5672",
  `amqp://${username}:${password}@${RMQServerIP}:5672`,
  function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      channel.assertExchange(exchangeName, "topic", {
        durable: true,
        autoDelete: true,
      });

      var repetitions = msgPublishRate * experimentDuration;

      continuousSend(channel, connection, repetitions);
    });
  }
);

const continuousSend = (channel, connection, rep) => {
  var msg = { temp: 26, distance: 1000, severity: "critical" };

  channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(msg)), {
    timestamp: Date.now(),
  });

  console.log(" [%d] Sent %s", rep, msg);

  rep--;

  setTimeout(function () {
    if (rep > 0) {
      continuousSend(channel, connection, rep);
    } else {
      connection.close();
    }
  }, 1000 / msgPublishRate);
};
