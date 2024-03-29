// const amqp = require("amqplib/callback_api");
const authConfig = require("../config/auth.config");
// const consumerConfig = require("../config/consumer.config");
// const consumerProcess = require("./consumer.controller");

// const dbConfig = require("../config/db.config");
// const MongoClient = require("mongodb").MongoClient;

const fetch = require("node-fetch");

const { gatherDBdata } = require("../controllers/db.controller");

// createProcess = (req, res) => {
//   consumerProcess.createConsumerProcess(req.body);
//   consumerConfig.NR_OF_CONSUMERS = ++consumerConfig.NR_OF_CONSUMERS;
//   res.status(200).send({
//     id: consumerConfig.NR_OF_CONSUMERS,
//     creationTimestamp: Date.now(),
//   });
// };

generateOverviewData = async (req, res) => {
  // let { timings, loopCounter } = req.body;
  let { timings } = req.body;
  // console.log(
  //   "Consumer function generateOverviewData.",
  //   "\nLoopCounter: ",
  //   loopCounter,
  //   "\nTimeframe: ",
  //   timings.timeframe,
  //   "\nIntervals: ",
  //   timings.intervals
  // );

  const dataTimeframeInSecs = timings.timeframe.toString();
  const dataIntervalsInSecs = timings.intervals.toString();

  let url = `http://rabbitmq-ext-svc-${authConfig.USERNAME}:15672/`;
  let username = `${authConfig.USERNAME}`;
  let password = `${authConfig.PASSWORD}`;
  let headers = {
    Authorization:
      "Basic " + Buffer.from(username + ":" + password).toString("base64"),
  };
  let overviewData = {};
  let errors = 0;

  // let response = await fetch(url, {
  //   method: "GET",
  //   headers: headers,
  // });
  // if (response.ok) {
  //   // if HTTP-status is 200-299
  //   let json = await response.json();
  //   console.log("Overview data is :", json);
  // } else {
  //   alert("HTTP-Error: " + response.status);
  // }

  overviewData.DBdata = await gatherDBdata(timings.timeframe);

  // await fetch(
  //   url +
  //     `api/exchanges?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
  //   {
  //     method: "GET",
  //     headers: headers,
  //   }
  // )
  //   .then(async (response) => {
  //     // console.log("exchanges response: ", response);
  //     if (response.ok) {
  //       // if HTTP-status is 200-299
  //       let json = await response.json();
  //       // console.log("\nExchanges data is :", json);
  //       overviewData.msgsRcvdByExchanges = 0;
  //       overviewData.msgsRoutedByExchanges = 0;
  //       overviewData.incomingMsgRateToExchanges = [];
  //       json.map((exchange, index) => {
  //         if (!(exchange.name.startsWith("amq.") || exchange.name === "")) {
  //           if (
  //             exchange.message_stats != undefined &&
  //             typeof exchange.message_stats.publish_in === "number"
  //           ) {
  //             overviewData.msgsRcvdByExchanges +=
  //               exchange.message_stats.publish_in;
  //           }
  //           if (
  //             exchange.message_stats != undefined &&
  //             typeof exchange.message_stats.publish_out === "number"
  //           ) {
  //             overviewData.msgsRoutedByExchanges +=
  //               exchange.message_stats.publish_out;
  //           }
  //           if (
  //             exchange.message_stats != undefined &&
  //             exchange.message_stats.publish_in_details != undefined
  //           ) {
  //             overviewData.incomingMsgRateToExchanges[exchange] = {
  //               exchangeName: exchange.name,
  //               avgValue: exchange.message_stats.publish_in_details.avg,
  //               avgRate: exchange.message_stats.publish_in_details.avg_rate,
  //             };
  //           }
  //         }
  //       });
  //       // console.log(
  //       //   "Messages published to exchanges: ",
  //       //   overviewData.msgsRcvdByExchanges,
  //       //   "\nMessages routed from exchanges: ",
  //       //   overviewData.msgsRoutedByExchanges,
  //       //   "\nIncoming message rate to exchanges: ",
  //       //   overviewData.incomingMsgRateToExchanges
  //       // );
  //     } else {
  //       // alert("HTTP-Error: " + response.status);
  //       console.log("HTTP-Error: " + response.status);
  //       res.status(500).send({ message: "HTTP-Error: " + response.status });
  //       errors++;
  //     }
  //   })
  //   .catch((err) => {
  //     console.log("1st request error: ", err);
  //     res.status(500).send({ message: "Unknown error: " + err });
  //     errors++;
  //   });

  // if (errors) return;

  await fetch(
    url +
      `api/queues?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&lengths_age=${dataTimeframeInSecs}&lengths_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
    {
      method: "GET",
      headers: headers,
    }
  )
    .then(async (response) => {
      // console.log("queues response: ", response);
      if (response.ok) {
        // if HTTP-status is 200-299
        let json = await response.json();
        // console.log("\nQueues data is :", json);
        overviewData.bytesOfMsgsInQueues = 0;
        overviewData.msgsDeliveredToConsumersByActiveQueues = 0;
        json.map((queue, index) => {
          overviewData.bytesOfMsgsInQueues += queue.message_bytes;
          if (queue.message_stats != undefined) {
            overviewData.msgsDeliveredToConsumersByActiveQueues +=
              queue.message_stats.deliver;
          }
        });
      } else {
        alert("HTTP-Error: " + response.status);
        console.log("HTTP-Error: " + response.status);
        res.status(500).send({ message: "HTTP-Error: " + response.status });
        errors++;
      }
    })
    .catch((err) => {
      console.log("2nd request error: ", err);
      res.status(500).send({ message: "Unknown error: " + err });
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
      // console.log("overview response: ", response);
      if (response.ok) {
        // if HTTP-status is 200-299
        let json = await response.json();
        // console.log("Overview data is :", json);
        // console.log("\nMessage_stats: ", json.message_stats);
        if (json.message_stats != undefined) {
          if (
            json.message_stats.ack != undefined &&
            json.message_stats.ack_details != undefined
          ) {
            let length = json.message_stats.ack_details.samples.length;

            overviewData.msgsAcknowledged = {
              totalMsgs: json.message_stats.ack,
              avgValue: json.message_stats.ack_details.avg,
              avgRate: json.message_stats.ack_details.avg_rate,
              currentDifference:
                json.message_stats.ack_details.samples[0].sample -
                json.message_stats.ack_details.samples[length - 1].sample,
            };
          } else if (json.message_stats.ack != undefined) {
            overviewData.msgsAcknowledged = {
              totalMsgs: json.message_stats.ack,
            };
          }
          // overviewData.totalMsgsAck = json.message_stats.ack;
          // overviewData.msgsAckAvgValue = json.message_stats.ack_details.avg;
          // overviewData.msgsAckAvgRate = json.message_stats.ack_details.avg_rate;
          if (
            json.message_stats.deliver != undefined &&
            json.message_stats.deliver_details != undefined
          ) {
            overviewData.msgsDeliveredToConsumers = {
              totalMsgs: json.message_stats.deliver,
              avgValue: json.message_stats.deliver_details.avg,
              avgRate: json.message_stats.deliver_details.avg_rate,
            };
          } else if (json.message_stats.deliver != undefined) {
            overviewData.msgsDeliveredToConsumers = {
              totalMsgs: json.message_stats.deliver,
            };
          }
          // overviewData.totalMsgsDeliveredToConsumers = json.message_stats.deliver;
          // overviewData.msgsDeliveredToConsumersAvgValue =
          //   json.message_stats.deliver_details.avg;
          // overviewData.msgsDeliveredToConsumersAvgRate =
          //   json.message_stats.deliver_details.avg_rate;
          if (
            json.message_stats.drop_unroutable != undefined &&
            json.message_stats.drop_unroutable_details != undefined
          ) {
            let length =
              json.message_stats.drop_unroutable_details.samples.length;

            overviewData.msgsDroppedAsUnroutable = {
              totalMsgs: json.message_stats.drop_unroutable,
              avgValue: json.message_stats.drop_unroutable_details.avg,
              avgRate: json.message_stats.drop_unroutable_details.avg_rate,
              currentDifference:
                json.message_stats.drop_unroutable_details.samples[0].sample -
                json.message_stats.drop_unroutable_details.samples[length - 1]
                  .sample,
            };
          } else if (json.message_stats.drop_unroutable != undefined) {
            overviewData.msgsDroppedAsUnroutable = {
              totalMsgs: json.message_stats.drop_unroutable,
            };
          }
          // overviewData.totalMsgsDroppedUnroutable =
          //   json.message_stats.drop_unroutable;
          // overviewData.msgsDroppedUnroutableAvgValue =
          //   json.message_stats.drop_unroutable_details.avg;
          // overviewData.msgsDroppedUnroutableAvgRate =
          //   json.message_stats.drop_unroutable_details.avg_rate;
          if (
            json.message_stats.publish != undefined &&
            json.message_stats.publish_details != undefined
          ) {
            let length = json.message_stats.publish_details.samples.length;

            overviewData.msgsPublished = {
              totalMsgs: json.message_stats.publish,
              avgValue: json.message_stats.publish_details.avg,
              avgRate: json.message_stats.publish_details.avg_rate,
              currentDifference:
                json.message_stats.publish_details.samples[0].sample -
                json.message_stats.publish_details.samples[length - 1].sample,
            };
          } else if (json.message_stats.publish != undefined) {
            overviewData.msgsPublished = {
              totalMsgs: json.message_stats.publish,
            };
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
        alert("HTTP-Error: " + response.status);
        console.log("HTTP-Error: " + response.status);
        res.status(500).send({ message: "HTTP-Error: " + response.status });
        errors++;
      }
    })
    .catch((err) => {
      console.log("3rd request error: ", err);
      res.status(500).send({ message: "Unknown error: " + err });
      errors++;
    });

  if (errors) return;

  // console.log("OverviewData: ", overviewData);

  res.status(200).send({
    message: "Overview data was generated successfully.",
    overviewData: overviewData,
  });
};

const overviewController = {
  // createProcess,
  generateOverviewData,
};

module.exports = overviewController;
