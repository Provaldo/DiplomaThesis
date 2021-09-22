#!/usr/bin/env node
const { printResults } = require("./printResults");
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
    {
      consumerName: String,
      exchangeName: String,
      queueName: String,
      content: Object,
      serialNumber: Number,
      topic: String,
      producedAt: Number,
      receivedAt: Number,
      conditionMet: Object,
    },
    {
      timestamps: true,
    }
  )
);

getData = async (
  db,
  dbSamples,
  overviewData,
  dataIntervalsInSecs,
  msgPublishRate,
  nrOfProducers,
  experimentDuration
) => {
  let samplesLength = overviewData.msgsPublished.samples.length;
  for (let i = 0; i < samplesLength - 1; i++) {
    dbSamples.push({});
    dbSamples[i].timestamp =
      overviewData.msgsPublished.samples[samplesLength - i - 2].timestamp;
  }

  // let temp = await Promise.all([
  let temp = await Promise.all([
    Message.countDocuments({
      createdAt: {
        $lt: new Date(
          dbSamples[0].timestamp - dataIntervalsInSecs * 1000
        ).toISOString(),
      },
    }),
    ...dbSamples.map((element, index, array) => {
      return Message.countDocuments({
        createdAt: {
          $lt: new Date(dbSamples[index].timestamp).toISOString(),
        },
      });
    }),
  ]);
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(
  //         dbSamples[0].timestamp - dataIntervalsInSecs * 1000
  //       ).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[0].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[1].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[2].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[3].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[4].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[5].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[6].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[7].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[8].timestamp).toISOString(),
  //     },
  //   }),
  //   Message.countDocuments({
  //     createdAt: {
  //       $lt: new Date(dbSamples[9].timestamp).toISOString(),
  //     },
  //   }),
  // ]);

  for (let i = 0; i < samplesLength - 1; i++) {
    dbSamples[i].previousInsertsValue = temp[i];
    dbSamples[i].currentInsertsValue = temp[i + 1];
    dbSamples[i].insertValueDifference = temp[i + 1] - temp[i];
    dbSamples[i].insertRatePerSecond =
      dbSamples[i].insertValueDifference / dataIntervalsInSecs;
  }

  let avgInsertRateToDB = 0;
  for (let i = 0; i < dbSamples.length; i++) {
    avgInsertRateToDB += dbSamples[i].insertValueDifference;
  }
  avgInsertRateToDB = avgInsertRateToDB / dbSamples.length;
  let avgInsertRateToDBperSecond = avgInsertRateToDB / dataIntervalsInSecs;

  let insertRateToDBperSecondVariance = 0;
  for (let i = 0; i < dbSamples.length; i++) {
    insertRateToDBperSecondVariance += Math.pow(
      avgInsertRateToDBperSecond -
        dbSamples[i].insertValueDifference / dataIntervalsInSecs,
      2
    );
  }
  insertRateToDBperSecondVariance =
    insertRateToDBperSecondVariance / dbSamples.length;

  printResults(
    overviewData,
    dbSamples,
    avgInsertRateToDBperSecond,
    insertRateToDBperSecondVariance,
    dataIntervalsInSecs,
    msgPublishRate,
    nrOfProducers,
    experimentDuration
  );
  db.close();
};

exports.gatherDBdata = (
  dbConfig,
  overviewData,
  dataIntervalsInSecs,
  msgPublishRate,
  nrOfProducers,
  experimentDuration
) => {
  const { dbIP, dbPort, dbUsername, dbPassword, user } = dbConfig;

  mongoose
    .connect(
      `mongodb://${dbUsername}:${dbPassword}@${dbIP}:${dbPort}/${user}?authSource=admin&w=1`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    )
    .then((connection) => {})
    .catch((err) => {
      console.error("Connection error", err);
      process.exit();
    });

  var db = mongoose.connection;

  db.on("error", console.error.bind(console, "connection error:"));

  let dbSamples = [];

  db.once("open", function () {
    getData(
      db,
      dbSamples,
      overviewData,
      dataIntervalsInSecs,
      msgPublishRate,
      nrOfProducers,
      experimentDuration
    );
  });
};
