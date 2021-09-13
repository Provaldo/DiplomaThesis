const { authSession } = require("../middlewares");
const { rmqConsumer, rmqOverview } = require("../controllers/rabbitmq");

module.exports = function (app) {
  app.get(
    "/api/testFunction",
    [authSession.verifySession],
    rmqConsumer.deleteConsumerDeployment
  );

  app.post(
    "/api/testFunction",
    [authSession.verifySession],
    rmqOverview.setOverviewTimings
  );
};
