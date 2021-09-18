#!/usr/bin/env node
var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const RMQServerData = require("./monitorRMQServerOperations");

const dataTimeframeInSecs = "150";
const dataIntervalsInSecs = "15";
const experimentDuration = 180;

const msgPublishRate = 70;
const nrOfProducers = 6;

const consumerCPU = "ulimited";
const consumerMEM = "unlimited";
const RMQServerCPU = "unlimited"; // "1000m";
const RMQServerMEM = "unlimited"; // "256Mi";
const dbCPU = "unlimited";
const dbMEM = "unlimited";
const containerResources = {
  consumerCPU,
  consumerMEM,
  RMQServerCPU,
  RMQServerMEM,
  dbCPU,
  dbMEM,
};

// const databaseService = "10.97.3.119";
const dbIP = "192.168.49.2";
const dbPort = "31054";
const dbUsername = "username";
const dbPassword = "password";

const user = "mple";
const pass = "123456";

const RMQServerIP = "192.168.49.2";
const RMQServerPort = "31812";

const config = { user, pass, RMQServerIP, RMQServerPort };

getDBdata = (db, dbSamples, loopsRemaining, previousInsertsValue) => {
  if (loopsRemaining > 0) {
    let sample = {};
    db.db.command({ serverStatus: 1 }, function (err, result) {
      sample.currentInsertsValue = result.opcounters.insert;
      if (previousInsertsValue != null) {
        sample.timestamp = Date.now();
        sample.previousInsertsValue = previousInsertsValue;
        // console.log("\n [@] Previous insertToDB value: ", previousInsertsValue);
        // console.log(
        //   " [@] Current insertToDB value: ",
        //   sample.currentInsertsValue
        // );
        sample.insertValueDifference =
          sample.currentInsertsValue - previousInsertsValue;
        // console.log(" [@] Value difference: ", sample.insertValueDifference);
        sample.insertRatePerSecond =
          sample.insertValueDifference / dataIntervalsInSecs;
        // console.log(
        //   " [@] insertToDB rate per second: ",
        //   sample.insertRatePerSecond
        // );
        dbSamples.push(sample);
      }
    });

    loopsRemaining--;
    setTimeout(() => {
      getDBdata(db, dbSamples, loopsRemaining, sample.currentInsertsValue);
    }, dataIntervalsInSecs * 1000);
  } else {
    let avgInsertRateToDB = 0;
    // dbData.forEach((element, index) => {
    //   if (index != 0) {
    //     avgInsertRate += element;
    //   }
    // });
    for (let i = 0; i < dbSamples.length; i++) {
      avgInsertRateToDB += dbSamples[i].insertValueDifference;
    }
    avgInsertRateToDB = avgInsertRateToDB / dbSamples.length;
    let avgInsertRateToDBperSecond = avgInsertRateToDB / dataIntervalsInSecs;
    // console.log(
    //   "\n [***] Average insert rate to DB per second: ",
    //   avgInsertRateToDBperSecond
    // );

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

    RMQServerData.getRMQdata(
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
    );
    db.close();
  }
};

exports.main = () => {
  mongoose
    .connect(
      //   `mongodb://username:password@${databaseService}:27017/mple?authSource=admin&w=1`
      `mongodb://${dbUsername}:${dbPassword}@${dbIP}:${dbPort}/${user}?authSource=admin&w=1`,
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
      //   console.log("Successfully connect to MongoDB.");
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

  let dbSamples = [];
  let loopsRemaining = dataTimeframeInSecs / dataIntervalsInSecs + 1;
  // let loopsRemaining = dataTimeframeInSecs / dataIntervalsInSecs + 2;

  db.once("open", function () {
    // db.db.stats(function (err, stats) {
    //   console.log("stats: ", stats);
    // });
    // db.db.stats();
    getDBdata(db, dbSamples, loopsRemaining, null);
    // db.db.command({ serverStatus: 1 }, function (err, result) {
    //   console.log("initial insert value: ", result.opcounters.insert);
    //   getDBdata(db, dbData, loopsRemaining, result.opcounters.insert);
    // });
  });

  //   db.command({ serverStatus: 1, opcounters: 1 }, function (err, result) {
  //     console.log("result: ", result);
  //   });
};

// main();
