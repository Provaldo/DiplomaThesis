const rmqSecret = require("./rmq.secret.controller");
const rmqDeployment = require("./rmq.deployment.controller");
const rmqIntService = require("./rmq.intSvc.controller");
const rmqExtService = require("./rmq.extSvc.controller");
const rmqConsumer = require("./rmq.consumer.controller");

module.exports = {
  rmqSecret,
  rmqDeployment,
  rmqIntService,
  rmqExtService,
  rmqConsumer,
};
