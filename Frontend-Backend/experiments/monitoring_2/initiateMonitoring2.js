#!/usr/bin/env node
const RMQServerData = require("./RMQServerMonitoring2");

const dataTimeframeInSecs = "600";
const dataIntervalsInSecs = "15";
const experimentDuration = 200;

const msgPublishRate = 33;
const nrOfProducers = 9;

const user = "mple";
const pass = "123456";

const dbIP = "192.168.49.2";
const dbPort = "30792";
const dbUsername = "username";
const dbPassword = "password";
const dbConfig = { dbIP, dbPort, dbUsername, dbPassword, user };

const RMQServerIP = "192.168.49.2";
const RMQServerPort = "31641";

const config = { user, pass, RMQServerIP, RMQServerPort };

RMQServerData.getRMQdata(
  config,
  dbConfig,
  dataTimeframeInSecs,
  dataIntervalsInSecs,
  msgPublishRate,
  nrOfProducers,
  experimentDuration
);
