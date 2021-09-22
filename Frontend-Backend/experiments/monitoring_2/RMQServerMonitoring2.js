#!/usr/bin/env node
const fetch = require("node-fetch");
const { gatherDBdata } = require("./DBMonitoring");

exports.getRMQdata = async (
  config,
  dbConfig,
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

  gatherDBdata(
    dbConfig,
    overviewData,
    dataIntervalsInSecs,
    msgPublishRate,
    nrOfProducers,
    experimentDuration
  );
};
