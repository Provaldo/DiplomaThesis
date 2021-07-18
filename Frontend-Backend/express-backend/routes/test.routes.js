const { authSession } = require("../middlewares");
const { rmqConsumer } = require("../controllers/rabbitmq");

module.exports = function (app) {
  app.get(
    "/api/testFunction",
    [authSession.verifySession],
    rmqConsumer.deleteConsumerDeployment
  );
};
