const consumerController = require("../controllers/consumer.controller");

module.exports = function (app) {
  app.post("/consumer/createProcess", consumerController.createProcess);

  app.post("/consumer/deleteProcess");
};
