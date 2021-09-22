#!/usr/bin/env node
const { csvFileCreator } = require("../csvFileCreator");

exports.printResults = (
  overviewData,
  dbSamples,
  avgInsertRateToDBperSecond,
  insertRateToDBperSecondVariance,
  dataIntervalsInSecs,
  msgPublishRate,
  nrOfProducers,
  experimentDuration
) => {
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

  csvData.timestamps = [];
  for (let i = 0; i < dbSamples.length; i++) {
    let timestamp = new Date(dbSamples[i].timestamp);
    timestamp = timestamp.toLocaleTimeString();
    csvData.timestamps.push(timestamp);
  }

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
      console.log("\n [#] Previous msgsDlivrdToCons value: ", previousValue);
      console.log(" [#] Current msgsDlivrdToCons value: ", currentValue);
      console.log(" [#] Value difference: ", currentValue - previousValue);
      console.log(
        " [#] MsgsDlivrdToCons rate per second: ",
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

  delete overviewData.msgsAcknowledged.samples;
  delete overviewData.msgsDeliveredToConsumers.samples;
  delete overviewData.msgsPublished.samples;

  console.log("\n####### Overview #######\n");

  console.log("OverviewData: ", overviewData);

  csvFileCreator(csvData);
};
