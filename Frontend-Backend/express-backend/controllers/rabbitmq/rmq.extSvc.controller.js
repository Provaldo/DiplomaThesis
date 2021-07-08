const k8s = require("@kubernetes/client-node");

const serviceExists = async (namespace, labelSelector) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";

  try {
    var apiResponse = await k8sApi.listNamespacedService(
      namespace,
      pretty,
      undefined,
      undefined,
      undefined,
      labelSelector
    );

    if (apiResponse.body.items.length == 0) {
      return 0;
    } else {
      return 1;
    }
  } catch (err) {
    console.log("RabbitMQ deployment list error", err);
    // ProcessingInstruction.exit(); // I don't know what this does
    return err;
  }
};

deleteExternalService = (req, res, next) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";
  var labelSelector = `app=rabbitmq-ext-svc-${req.user.username}`;
  var serviceName = `rabbitmq-ext-svc-${req.user.username}`;

  serviceExists(namespace, labelSelector).then((exists) => {
    if (exists == 1) {
      k8sApi
        .deleteNamespacedService(serviceName, namespace, pretty)
        .then((response) => {
          if (response.body.status == "Success") {
            next();
          } else {
            res.status(404).send({
              message: `External Service deletion API call failed. Error message: ${response.body.message}`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("External Service deletion error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 0) {
      res.status(404).send({
        message:
          "External Service deletion API call failed. No External Service exists for this user.",
      });
    } else {
      console.log("Error message: ", exists);
      res.status(500).send({ message: `Error message: ${exists}` });
    }
  });
};

externalServiceCreator = (req, res, next) => {
  var namespace = "default";

  externalServiceObject = {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: `rabbitmq-ext-svc-${req.user.username}`,
      labels: { app: `rabbitmq-ext-svc-${req.user.username}` },
    },
    spec: {
      selector: { app: `rabbitmq-server-${req.user.username}` },
      type: "LoadBalancer",
      ports: [
        {
          port: 15672,
          targetPort: 15672,
          // nodePort: 32000  // by not specifying a nodePort, it is automatically assigned based on available ports. We want that.
        },
      ],
    },
  };

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  k8sApi
    .createNamespacedService(namespace, externalServiceObject)
    .then((response) => {
      console.log(
        "The External-Service-creation API response.body.spec.ports.nodePort is: ",
        response.body.spec.ports[0].nodePort
      );
      req.rabbitmqServer.nodePort = response.body.spec.ports[0].nodePort;
      req.rabbitmqServer.address = response.body.spec.clusterIP + ":15672";
      console.log(
        "The ip address of the RMQserver is: ",
        req.rabbitmqServer.address
      );
      next();
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      console.log("RabbitMQ external service creation error", err);
      // ProcessingInstruction.exit(); // I don't know what this does
      return;
    });
};

const rmqExtService = { externalServiceCreator, deleteExternalService };

module.exports = rmqExtService;
