const { authSession, verifyConsumer } = require("../middlewares");
const rmqController = require("../controllers/rabbitmq/rmq.producer.controller");
const {
  // rmqSecret,
  rmqServerDeployment,
  rmqIntService,
  rmqExtService,
  rmqConsumer,
  rmqProducer,
  rmqOverview,
} = require("../controllers/rabbitmq");
const dbController = require("../controllers/db.controller");
const rmqRequestValidator = require("../validation/rmq_requests");

module.exports = function (app) {
  app.post(
    "/api/rabbitmq/user/producerCreate",
    [authSession.verifySession],
    rmqProducer.userRequestProducer
  );

  app.post(
    "/api/rabbitmq/user/consumerCreate",
    [authSession.verifySession],
    rmqRequestValidator.validateRMQConsumerRequestInput,
    verifyConsumer.checkDuplicateConsumer,
    rmqConsumer.createConsumerDeployment,
    dbController.registerConsumer
  );

  app.post(
    "/api/rabbitmq/user/consumerDelete",
    [authSession.verifySession],
    rmqConsumer.deleteConsumerDeployment,
    dbController.removeConsumer
  );

  // app.delete(
  //   "/api/rabbitmq/user/consumerDeleteAll",
  //   [authSession.verifySession],
  //   rmqConsumer.deleteConsumerDeployment,
  //   dbController.removeConsumer
  // );

  app.post(
    "/api/rabbitmq/user/createRMQServer",
    [authSession.verifySession],
    rmqServerDeployment.deploymentCreator,
    rmqIntService.internalServiceCreator,
    rmqExtService.externalServiceCreator,
    dbController.registerRMQServer
  );

  app.post(
    "/api/rabbitmq/user/deleteRMQServer",
    [authSession.verifySession],
    rmqServerDeployment.deleteRMQServerDeployment,
    rmqIntService.deleteInternalService,
    rmqExtService.deleteExternalService,
    dbController.removeRMQServer
  );

  app.get(
    "/api/rabbitmq/user/overview",
    authSession.verifySession,
    rmqOverview.exposeConsumerIfExists,
    // rmqOverview.requestDataGenerationFromConsumer,
    rmqOverview.createStream
  );

  app.post(
    "/api/rabbitmq/user/overview/setTimings",
    [authSession.verifySession],
    rmqOverview.setOverviewTimings
  );
};
