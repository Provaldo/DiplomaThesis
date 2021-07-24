const rmqSecret = require("./rmq.secret.controller");
const rmqServerDeployment = require("./rmq.server.controller");
const rmqIntService = require("./rmq.intSvc.controller");
const rmqExtService = require("./rmq.extSvc.controller");
const rmqConsumer = require("./rmq.consumer.controller");
const rmqProducer = require("./rmq.producer.controller");

module.exports = {
  rmqSecret,
  rmqServerDeployment,
  rmqIntService,
  rmqExtService,
  rmqConsumer,
  rmqProducer,
};
