const { authSession } = require("../middlewares");
const rmqController = require("../controllers/rabbitmq.controller");
const dbController = require("../controllers/db.controller");
const inputValidationRMQServerCreation = require("../validation/rmqs_request");

module.exports = function (app) {
  app.post(
    "/api/rabbitmq/user/producer",
    [authSession.verifySession],
    rmqController.userRequestProducer
  );

  app.post(
    "/api/rabbitmq/user/consumer",
    [authSession.verifySession],
    rmqController.userRequestConsumer
  );

  app.post(
    "/api/rabbitmq/user/createRMQServer",
    [authSession.verifySession, inputValidationRMQServerCreation],
    rmqController.deploymentCreator,
    rmqController.internalServiceCreator,
    rmqController.externalServiceCreator,
    dbController.registerRMQServer
  );

  app.post(
    "/api/rabbitmq/user/deleteRMQServer",
    [authSession.verifySession],
    rmqController.deleteRMQServerDeployment,
    rmqController.deleteInternalService,
    rmqController.deleteExternalService,
    dbController.removeRMQServer
  );
};
