#!/usr/bin/env node
const monitorDBoperations = require("./monitorDBoperations");

const synchronize = () => {
  let currentTimestamp = Date.now();

  let mod = currentTimestamp % 15000;

  if (mod > 14100 && mod < 14400) {
    monitorDBoperations.main();
  } else {
    setTimeout(() => synchronize(), 200);
  }
};

synchronize();
