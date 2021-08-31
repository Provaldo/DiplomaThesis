#!/usr/bin/env node
const fetch = require("node-fetch");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const username = "mple";
const password = "123456";
const RMQServerIP = "10.111.124.83";

const dataTimeframeInSecs = "6";
const dataIntervalsInSecs = "1";

const databaseService = "10.108.124.93";

const gatherData = async () => {
  mongoose
    .connect(
      `mongodb://username:password@${databaseService}:27017/mple?authSource=admin&w=1`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //   auth: { authSource: "admin" },
        //   user: "username",
        //   pass: "password",
        // useMongoClient: true, // WARNING: The `useMongoClient` option is no longer necessary in mongoose 5.x, please remove it.
      }
    )
    .then((connection) => {
      console.log("Successfully connect to MongoDB.");
      // connection.db.command({ serverStatus: 1 }, function (err, result) {
      //   console.log("result: ", result.opcounters);
      // });
    })
    .catch((err) => {
      console.error("Connection error", err);
      process.exit();
    });

  var db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error:"));

  db.once("open", function () {
    // db.db.stats(function (err, stats) {
    //   console.log("stats: ", stats);
    // });
    // db.db.stats();
    db.db.command({ serverStatus: 1 }, function (err, result) {
      console.log("result: ", result.opcounters);
    });
  });

  //   db.command({ serverStatus: 1, opcounters: 1 }, function (err, result) {
  //     console.log("result: ", result);
  //   });

  let url = `http://${RMQServerIP}:15672/`;
  let headers = {
    Authorization:
      "Basic " + Buffer.from(username + ":" + password).toString("base64"),
  };
  let overviewData = {};
  let errors = 0;

  await fetch(
    url +
      `api/exchanges?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
    {
      method: "GET",
      headers: headers,
    }
  )
    .then(async (response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        let json = await response.json();
        overviewData.incomingMsgRateToExchanges = [];
        json.map((exchange, index) => {
          if (!(exchange.name.startsWith("amq.") || exchange.name === "")) {
            if (
              exchange.message_stats != undefined &&
              exchange.message_stats.publish_in_details != undefined
            ) {
              overviewData.incomingMsgRateToExchanges[exchange] = {
                exchangeName: exchange.name,
                // avgValue: exchange.message_stats.publish_in_details.avg,
                avgRate: exchange.message_stats.publish_in_details.avg_rate,
              };
            }
          }
        });
      } else {
        console.log("HTTP-Error: " + response.status);
        errors++;
      }
    })
    .catch((err) => {
      console.log("1st request error: ", err);
      res.status(500).send({ message: "Unknown error: " + err });
      errors++;
    });

  if (errors) return;

  await fetch(
    url +
      `api/queues?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&lengths_age=${dataTimeframeInSecs}&lengths_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
    {
      method: "GET",
      headers: headers,
    }
  )
    .then(async (response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        let json = await response.json();
        overviewData.bytesOfMsgsInQueues = 0;
        json.map((queue, index) => {
          overviewData.bytesOfMsgsInQueues += queue.message_bytes;
        });
      } else {
        console.log("HTTP-Error: " + response.status);
        errors++;
      }
    })
    .catch((err) => {
      console.log("2nd request error: ", err);
      errors++;
    });

  if (errors) return;

  await fetch(
    url +
      `api/overview?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&lengths_age=${dataTimeframeInSecs}&lengths_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
    {
      method: "GET",
      headers: headers,
    }
  )
    .then(async (response) => {
      if (response.ok) {
        // if HTTP-status is 200-299
        let json = await response.json();
        if (json.message_stats != undefined) {
          if (
            json.message_stats.ack != undefined &&
            json.message_stats.ack_details != undefined
          ) {
            overviewData.msgsAcknowledged = {
              //   totalMsgs: json.message_stats.ack,
              //   avgValue: json.message_stats.ack_details.avg,
              avgRate: json.message_stats.ack_details.avg_rate,
            };
            //   } else if (json.message_stats.ack != undefined) {
            //     overviewData.msgsAcknowledged = {
            //       totalMsgs: json.message_stats.ack,
            //     };
          }
          // overviewData.totalMsgsAck = json.message_stats.ack;
          // overviewData.msgsAckAvgValue = json.message_stats.ack_details.avg;
          // overviewData.msgsAckAvgRate = json.message_stats.ack_details.avg_rate;
          if (
            json.message_stats.deliver != undefined &&
            json.message_stats.deliver_details != undefined
          ) {
            overviewData.msgsDeliveredToConsumers = {
              //   totalMsgs: json.message_stats.deliver,
              //   avgValue: json.message_stats.deliver_details.avg,
              avgRate: json.message_stats.deliver_details.avg_rate,
            };
            //   } else if (json.message_stats.deliver != undefined) {
            //     overviewData.msgsDeliveredToConsumers = {
            //       totalMsgs: json.message_stats.deliver,
            //     };
          }
          // overviewData.totalMsgsDeliveredToConsumers = json.message_stats.deliver;
          // overviewData.msgsDeliveredToConsumersAvgValue =
          //   json.message_stats.deliver_details.avg;
          // overviewData.msgsDeliveredToConsumersAvgRate =
          //   json.message_stats.deliver_details.avg_rate;
          if (
            json.message_stats.publish != undefined &&
            json.message_stats.publish_details != undefined
          ) {
            overviewData.msgsPublished = {
              //   totalMsgs: json.message_stats.publish,
              //   avgValue: json.message_stats.publish_details.avg,
              avgRate: json.message_stats.publish_details.avg_rate,
            };
            //   } else if (json.message_stats.publish != undefined) {
            //     overviewData.msgsPublished = {
            //       totalMsgs: json.message_stats.publish,
            //     };
          }
        }
        // overviewData.totalMsgsPublished = json.message_stats.publish;
        // overviewData.msgsPublishedAvgValue =
        //   json.message_stats.publish_details.avg;
        // overviewData.msgsPublishedAvgRate =
        //   json.message_stats.publish_details.avg_rate;
        // console.log("Churn_rates: ", json.churn_rates);
        // console.log("Queue_totals: ", json.queue_totals);
        if (json.queue_totals != undefined) {
          if (
            json.queue_totals.messages != undefined &&
            json.queue_totals.messages_details != undefined
          ) {
            overviewData.msgsInQueues = {
              totalMsgs: json.queue_totals.messages,
              avgValue: json.queue_totals.messages_details.avg,
              avgRate: json.queue_totals.messages_details.avg_rate,
            };
          } else if (json.queue_totals.messages != undefined) {
            overviewData.msgsInQueues = {
              totalMsgs: json.queue_totals.messages,
            };
          }
        }
        // overviewData.msgsInQueues = json.queue_totals.messages;
        // overviewData.msgsInQueuesAvgValue =
        //   json.queue_totals.messages_details.avg;
        // overviewData.msgsInQueuesAvgRate =
        //   json.queue_totals.messages_details.avg_rate;
        // console.log("Object_stats: ", json.object_totals);
        if (json.object_totals != undefined) {
          overviewData.numberOfConsumers = json.object_totals.consumers;
          overviewData.numberOfExchanges = json.object_totals.exchanges - 7;
          overviewData.numberOfQueues = json.object_totals.queues;
        }
      } else {
        console.log("HTTP-Error: " + response.status);
        errors++;
      }
    })
    .catch((err) => {
      console.log("3rd request error: ", err);
      errors++;
    });

  if (errors) return;

  //   const db = {};
  //   db.mongoose = mongoose;

  console.log("OverviewData: ", overviewData);
};

gatherData();
