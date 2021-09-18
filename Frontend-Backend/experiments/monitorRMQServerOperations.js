#!/usr/bin/env node
const fetch = require("node-fetch");
const { csvFileCreator } = require("./csvFileCreator");

// const username = "mple";
// const password = "123456";
// const RMQServerIP = "192.168.49.2";
// const RMQServerPort = "30161";

// const dataTimeframeInSecs = "30";
// const dataIntervalsInSecs = "5";

exports.getRMQdata = async (
  config,
  containerResources,
  dbSamples,
  avgInsertRateToDBperSecond,
  insertRateToDBperSecondVariance,
  dataTimeframeInSecs,
  dataIntervalsInSecs,
  msgPublishRate,
  nrOfProducers,
  experimentDuration
) => {
  let url = `http://${config.RMQServerIP}:${config.RMQServerPort}/`;
  let headers = {
    Authorization:
      "Basic " +
      Buffer.from(config.user + ":" + config.pass).toString("base64"),
  };
  let overviewData = {};
  let errors = 0;

  //   await fetch(
  //     url +
  //       `api/exchanges?msg_rates_age=${dataTimeframeInSecs}&msg_rates_incr=${dataIntervalsInSecs}&data_rates_age=${dataTimeframeInSecs}&data_rates_incr=${dataIntervalsInSecs}`,
  //     {
  //       method: "GET",
  //       headers: headers,
  //     }
  //   )
  //     .then(async (response) => {
  //       if (response.ok) {
  //         // if HTTP-status is 200-299
  //         let json = await response.json();
  //         overviewData.incomingMsgRateToExchanges = [];
  //         json.map((exchange, index) => {
  //           if (!(exchange.name.startsWith("amq.") || exchange.name === "")) {
  //             if (
  //               exchange.message_stats != undefined &&
  //               exchange.message_stats.publish_in_details != undefined
  //             ) {
  //               overviewData.incomingMsgRateToExchanges[exchange] = {
  //                 exchangeName: exchange.name,
  //                 // avgValue: exchange.message_stats.publish_in_details.avg,
  //                 avgRate: exchange.message_stats.publish_in_details.avg_rate,
  //               };
  //             }
  //           }
  //         });
  //       } else {
  //         console.log("HTTP-Error: " + response.status);
  //         errors++;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log("1st request error: ", err);
  //       res.status(500).send({ message: "Unknown error: " + err });
  //       errors++;
  //     });

  //   if (errors) return;

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
            let msgsAcknowledgedperSecondVariance = 0;
            let samples = json.message_stats.ack_details.samples;
            let avg = json.message_stats.ack_details.avg_rate;

            for (let i = 1; i < samples.length; i++) {
              let samplesDifference = samples[i - 1].sample - samples[i].sample;

              msgsAcknowledgedperSecondVariance += Math.pow(
                avg - samplesDifference / dataIntervalsInSecs,
                2
              );
            }
            msgsAcknowledgedperSecondVariance =
              msgsAcknowledgedperSecondVariance / (samples.length - 1);

            overviewData.msgsAcknowledged = {
              //   totalMsgs: json.message_stats.ack,
              //   avgValue: json.message_stats.ack_details.avg,
              avgRate: json.message_stats.ack_details.avg_rate,
              samples: json.message_stats.ack_details.samples,
              rateVariance: msgsAcknowledgedperSecondVariance,
              stdDev: Math.sqrt(msgsAcknowledgedperSecondVariance),
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
              samples: json.message_stats.deliver_details.samples,
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
            let msgsPublishedPerSecondVariance = 0;
            let samples = json.message_stats.publish_details.samples;
            let avg = json.message_stats.publish_details.avg_rate;

            for (let i = 1; i < samples.length; i++) {
              let samplesDifference = samples[i - 1].sample - samples[i].sample;

              msgsPublishedPerSecondVariance += Math.pow(
                avg - samplesDifference / dataIntervalsInSecs,
                2
              );
            }
            msgsPublishedPerSecondVariance =
              msgsPublishedPerSecondVariance / (samples.length - 1);

            overviewData.msgsPublished = {
              //   totalMsgs: json.message_stats.publish,
              //   avgValue: json.message_stats.publish_details.avg,
              avgRate: json.message_stats.publish_details.avg_rate,
              samples: json.message_stats.publish_details.samples,
              rateVariance: msgsPublishedPerSecondVariance,
              stdDev: Math.sqrt(msgsPublishedPerSecondVariance),
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
              //   samples: json.message_stats.ack_details.samples,
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

  // #######################################################################
  // #######################################################################
  // #######################################################################

  console.log("\n########### EXPERIMENT DETAILS ###########n");
  console.log("Number of consumers: ", overviewData.numberOfConsumers);
  console.log(
    "Requested publish frequency per producer: ",
    msgPublishRate,
    "/s"
  );
  console.log("Numbers of producers: ", nrOfProducers);
  console.log(
    "Requested total publish frequency: ",
    nrOfProducers * msgPublishRate
  );
  console.log(
    "Observed publish frequency: ",
    overviewData.msgsPublished.avgRate
  );
  console.log(
    "Variance of observed publish frequency: ",
    overviewData.msgsPublished.rateVariance
  );
  console.log(
    "Standard Deviation of observed publish frequency: ",
    overviewData.msgsPublished.stdDev
  );
  console.log(
    "Observed frequency of message delivery to consumers: ",
    overviewData.msgsDeliveredToConsumers.avgRate
  );
  console.log(
    "Observed frequency of message acknowledgement from consumers: ",
    overviewData.msgsAcknowledged.avgRate
  );
  console.log(
    "Variance of observed frequency of message acknowledgement from consumers: ",
    overviewData.msgsAcknowledged.rateVariance
  );
  console.log(
    "Standard Deviation of observed frequency of message acknowledgement from consumers: ",
    overviewData.msgsAcknowledged.stdDev
  );
  console.log(
    "Observed frequency of insert operations to DB: ",
    avgInsertRateToDBperSecond
  );
  console.log(
    "Variance of observed frequency of insert operations to DB: ",
    insertRateToDBperSecondVariance
  );
  console.log(
    "Standard Deviation of observed frequency of insert operations to DB: ",
    Math.sqrt(insertRateToDBperSecondVariance)
  );
  let expectedInserts = nrOfProducers * msgPublishRate * experimentDuration;
  console.log(
    `\nExpected inserts to the DB: ${nrOfProducers} cons * ${msgPublishRate} msgs/s * ${experimentDuration} sec = ${expectedInserts} inserts`
  );
  console.log("Actual inserts to the DB:  inserts");
  // console.log(
  //   "\nConsumer container CPU limit: ",
  //   containerResources.consumerCPU
  // );
  // console.log(
  //   "Consumer container Memory limit: ",
  //   containerResources.consumerMEM
  // );
  // console.log(
  //   "RMQ Server container CPU limit: ",
  //   containerResources.RMQServerCPU
  // );
  // console.log(
  //   "RMQ Server container Memory limit: ",
  //   containerResources.RMQServerMEM
  // );
  // console.log("Database container CPU limit: ", containerResources.dbCPU);
  // console.log("Database container Memory limit: ", containerResources.dbMEM);

  // #######################################################################
  // #######################################################################
  // #######################################################################
  let csvData = {};

  csvData.inputFrequency = {};
  csvData.inputFrequency.average = overviewData.msgsPublished.avgRate;
  csvData.inputFrequency.variance = overviewData.msgsPublished.rateVariance;
  csvData.inputFrequency.stdDev = overviewData.msgsPublished.stdDev;
  csvData.inputFrequency.rateSamples = [];

  csvData.consumingFrequency = {};
  csvData.consumingFrequency.average = overviewData.msgsAcknowledged.avgRate;
  csvData.consumingFrequency.variance =
    overviewData.msgsAcknowledged.rateVariance;
  csvData.consumingFrequency.stdDev = overviewData.msgsAcknowledged.stdDev;
  csvData.consumingFrequency.rateSamples = [];

  csvData.dbInsertFrequency = {};
  csvData.dbInsertFrequency.average = avgInsertRateToDBperSecond;
  csvData.dbInsertFrequency.variance = insertRateToDBperSecondVariance;
  csvData.dbInsertFrequency.stdDev = Math.sqrt(insertRateToDBperSecondVariance);
  csvData.dbInsertFrequency.rateSamples = [];

  if (overviewData.msgsAcknowledged.samples != undefined) {
    for (
      index = overviewData.msgsAcknowledged.samples.length - 1;
      index > 0;
      index--
    ) {
      console.log(
        "\n########### Data sample ",
        overviewData.msgsAcknowledged.samples.length - index,
        " ###########"
      );

      let previousValue = overviewData.msgsAcknowledged.samples[index].sample;
      let currentValue =
        overviewData.msgsAcknowledged.samples[index - 1].sample;
      console.log("\n [*] Previous msgsAck value: ", previousValue);
      console.log(" [*] Current msgsAck value: ", currentValue);
      console.log(" [*] Value difference: ", currentValue - previousValue);
      console.log(
        " [*] MsgsAck rate per second: ",
        (currentValue - previousValue) / dataIntervalsInSecs
      );
      console.log(
        " [*] Sample end timestamp: ",
        overviewData.msgsAcknowledged.samples[index - 1].timestamp
      );
      csvData.consumingFrequency.rateSamples.push(
        (currentValue - previousValue) / dataIntervalsInSecs
      );

      previousValue =
        overviewData.msgsDeliveredToConsumers.samples[index].sample;
      currentValue =
        overviewData.msgsDeliveredToConsumers.samples[index - 1].sample;
      console.log("\n [#] Previous msgsDlivrdToCust value: ", previousValue);
      console.log(" [#] Current msgsDlivrdToCust value: ", currentValue);
      console.log(" [#] Value difference: ", currentValue - previousValue);
      console.log(
        " [#] MsgsDlivrdToCust rate per second: ",
        (currentValue - previousValue) / dataIntervalsInSecs
      );
      console.log(
        " [#] Sample end timestamp: ",
        overviewData.msgsDeliveredToConsumers.samples[index - 1].timestamp
      );

      previousValue = overviewData.msgsPublished.samples[index].sample;
      currentValue = overviewData.msgsPublished.samples[index - 1].sample;
      console.log(
        "\n [$] Previous msgsPublishedToServer value: ",
        previousValue
      );
      console.log(" [$] Current msgsPublishedToServer value: ", currentValue);
      console.log(" [$] Value difference: ", currentValue - previousValue);
      console.log(
        " [$] MsgsPublishedToServer rate per second: ",
        (currentValue - previousValue) / dataIntervalsInSecs
      );
      console.log(
        " [$] Sample end timestamp: ",
        overviewData.msgsPublished.samples[index - 1].timestamp
      );
      csvData.inputFrequency.rateSamples.push(
        (currentValue - previousValue) / dataIntervalsInSecs
      );

      let normalIndex =
        overviewData.msgsAcknowledged.samples.length - index - 1;
      // let normalIndex = overviewData.msgsAcknowledged.samples.length - index;
      console.log(
        "\n [@] Previous insertsToDB value: ",
        dbSamples[normalIndex].previousInsertsValue
      );
      console.log(
        " [@] Current insertsToDB value: ",
        dbSamples[normalIndex].currentInsertsValue
      );
      console.log(
        " [@] Value difference: ",
        dbSamples[normalIndex].insertValueDifference
      );
      console.log(
        " [@] InsertsToDB rate per second: ",
        dbSamples[normalIndex].insertRatePerSecond
      );
      console.log(
        " [@] Sample end timestamp: ",
        dbSamples[normalIndex].timestamp
      );
      csvData.dbInsertFrequency.rateSamples.push(
        dbSamples[normalIndex].insertRatePerSecond
      );
    }
  }

  overviewData.avgInsertRateToDBperSecond = avgInsertRateToDBperSecond;
  overviewData.insertRateToDBperSecondVariance =
    insertRateToDBperSecondVariance;

  csvFileCreator(csvData);

  delete overviewData.msgsAcknowledged.samples;
  delete overviewData.msgsDeliveredToConsumers.samples;
  delete overviewData.msgsPublished.samples;

  console.log("\n####### Overview #######\n");

  console.log("OverviewData: ", overviewData);
};

// getRMQdata();
