const { authSession } = require("../middlewares");
const controller = require("../controllers/rabbitmq.controller");

module.exports = function (app) {
  app.post(
    "/api/rabbitmq/user/producer",
    [authSession.verifySession],
    controller.userRequestProducer
  );

  app.post(
    "/api/rabbitmq/user/consumer",
    [authSession.verifySession],
    controller.userRequestConsumer
  );
};