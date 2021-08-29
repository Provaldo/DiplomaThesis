// const amqp = require("amqplib/callback_api");
const authConfig = require("../config/auth.config");
// const consumerConfig = require("../config/consumer.config");
// const consumerProcess = require("./consumer.controller");

// const dbConfig = require("../config/db.config");
// const MongoClient = require("mongodb").MongoClient;

const fetch = require("node-fetch");

// createProcess = (req, res) => {
//   consumerProcess.createConsumerProcess(req.body);
//   consumerConfig.NR_OF_CONSUMERS = ++consumerConfig.NR_OF_CONSUMERS;
//   res.status(200).send({
//     id: consumerConfig.NR_OF_CONSUMERS,
//     creationTimestamp: Date.now(),
//   });
// };

generateOverviewData = async (req, res) => {
  console.log("Consumer function generateOverviewData");

  const dataTimeframeInSecs = "120";
  const dataIntervalsInSecs = "30";

  let url = `http://rabbitmq-ext-svc-${authConfig.USERNAME}:15672/`;
  let username = `${authConfig.USERNAME}`;
  let password = `${authConfig.PASSWORD}`;
  let headers = {
    Authorization:
      "Basic " + Buffer.from(username + ":" + password).toString("base64"),
  };
  let overviewData = {};

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

  await fetch(
    url +
      `api/exchanges?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
    {
      method: "GET",
      headers: headers,
    }
  )
    .then(async (response) => {
      // console.log("exchanges response: ", response);
      if (response.ok) {
        // if HTTP-status is 200-299
        let json = await response.json();
        // console.log("\nExchanges data is :", json);
        overviewData.msgsRcvdByExchanges = 0;
        overviewData.msgsRoutedByExchanges = 0;
        overviewData.incomingMsgRateToExchanges = [];
        json.map((exchange, index) => {
          if (!(exchange.name.startsWith("amq.") || exchange.name === "")) {
            if (
              exchange.message_stats != undefined &&
              typeof exchange.message_stats.publish_in === "number"
            ) {
              overviewData.msgsRcvdByExchanges +=
                exchange.message_stats.publish_in;
            }
            if (
              exchange.message_stats != undefined &&
              typeof exchange.message_stats.publish_out === "number"
            ) {
              overviewData.msgsRoutedByExchanges +=
                exchange.message_stats.publish_out;
            }
            if (
              exchange.message_stats != undefined &&
              exchange.message_stats.publish_in_details != undefined
            ) {
              overviewData.incomingMsgRateToExchanges[exchange] = {
                exchangeName: exchange.name,
                avgValue: exchange.message_stats.publish_in_details.avg,
                avgRate: exchange.message_stats.publish_in_details.avg_rate,
              };
            }
          }
        });
        // console.log(
        //   "Messages published to exchanges: ",
        //   overviewData.msgsRcvdByExchanges,
        //   "\nMessages routed from exchanges: ",
        //   overviewData.msgsRoutedByExchanges,
        //   "\nIncoming message rate to exchanges: ",
        //   overviewData.incomingMsgRateToExchanges
        // );
      } else {
        alert("HTTP-Error: " + response.status);
        console.log("HTTP-Error: " + response.status);
        res.status(500).send({ message: "HTTP-Error: " + response.status });
        return;
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Unknown error: " + err });
      return;
    });

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
        return;
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Unknown error: " + err });
      return;
    });

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
        overviewData.msgsAcknowledged = {
          totalMsgs: json.message_stats.ack,
          avgValue: json.message_stats.ack_details.avg,
          avgRate: json.message_stats.ack_details.avg_rate,
        };
        // overviewData.totalMsgsAck = json.message_stats.ack;
        // overviewData.msgsAckAvgValue = json.message_stats.ack_details.avg;
        // overviewData.msgsAckAvgRate = json.message_stats.ack_details.avg_rate;
        overviewData.msgsDeliveredToConsumers = {
          totalMsgs: json.message_stats.deliver,
          avgValue: json.message_stats.deliver_details.avg,
          avgRate: json.message_stats.deliver_details.avg_rate,
        };
        // overviewData.totalMsgsDeliveredToConsumers = json.message_stats.deliver;
        // overviewData.msgsDeliveredToConsumersAvgValue =
        //   json.message_stats.deliver_details.avg;
        // overviewData.msgsDeliveredToConsumersAvgRate =
        //   json.message_stats.deliver_details.avg_rate;
        overviewData.msgsDroppedAsUnroutable = {
          totalMsgs: json.message_stats.drop_unroutable,
          avgValue: json.message_stats.drop_unroutable_details.avg,
          avgRate: json.message_stats.drop_unroutable_details.avg_rate,
        };
        // overviewData.totalMsgsDroppedUnroutable =
        //   json.message_stats.drop_unroutable;
        // overviewData.msgsDroppedUnroutableAvgValue =
        //   json.message_stats.drop_unroutable_details.avg;
        // overviewData.msgsDroppedUnroutableAvgRate =
        //   json.message_stats.drop_unroutable_details.avg_rate;
        overviewData.msgsPublished = {
          totalMsgs: json.message_stats.publish,
          avgValue: json.message_stats.publish_details.avg,
          avgRate: json.message_stats.publish_details.avg_rate,
        };
        // overviewData.totalMsgsPublished = json.message_stats.publish;
        // overviewData.msgsPublishedAvgValue =
        //   json.message_stats.publish_details.avg;
        // overviewData.msgsPublishedAvgRate =
        //   json.message_stats.publish_details.avg_rate;
        // console.log("Churn_rates: ", json.churn_rates);
        // console.log("Queue_totals: ", json.queue_totals);
        overviewData.msgsInQueues = {
          totalMsgs: json.queue_totals.messages,
          avgValue: json.queue_totals.messages_details.avg,
          avgRate: json.queue_totals.messages_details.avg_rate,
        };
        // overviewData.msgsInQueues = json.queue_totals.messages;
        // overviewData.msgsInQueuesAvgValue =
        //   json.queue_totals.messages_details.avg;
        // overviewData.msgsInQueuesAvgRate =
        //   json.queue_totals.messages_details.avg_rate;
        // console.log("Object_stats: ", json.object_totals);
        overviewData.numberOfConsumers = json.object_totals.consumers;
        overviewData.numberOfExchanges = json.object_totals.exchanges - 7;
        overviewData.numberOfQueues = json.object_totals.queues;
      } else {
        alert("HTTP-Error: " + response.status);
        console.log("HTTP-Error: " + response.status);
        res.status(500).send({ message: "HTTP-Error: " + response.status });
        return;
      }
    })
    .catch((err) => {
      res.status(500).send({ message: "Unknown error: " + err });
      return;
    });

  console.log("OverviewData: ", overviewData);

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
