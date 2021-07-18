const { authSession, verifyConsumer } = require("../middlewares");
const rmqController = require("../controllers/rabbitmq.controller");
const {
  rmqSecret,
  rmqDeployment,
  rmqIntService,
  rmqExtService,
  rmqConsumer,
} = require("../controllers/rabbitmq");
const dbController = require("../controllers/db.controller");
const rmqRequestValidator = require("../validation/rmq_requests");

module.exports = function (app) {
  app.post(
    "/api/rabbitmq/user/producer",
    [authSession.verifySession],
    rmqController.userRequestProducer
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
    rmqRequestValidator.validateRMQServerRequestInput,
    rmqSecret.secretCreator,
    rmqDeployment.deploymentCreator,
    rmqIntService.internalServiceCreator,
    rmqExtService.externalServiceCreator,
    dbController.registerRMQServer
  );

  app.post(
    "/api/rabbitmq/user/deleteRMQServer",
    [authSession.verifySession],
    rmqSecret.deleteRMQSecret,
    rmqDeployment.deleteRMQServerDeployment,
    rmqIntService.deleteInternalService,
    rmqExtService.deleteExternalService,
    dbController.removeRMQServer
  );
};
