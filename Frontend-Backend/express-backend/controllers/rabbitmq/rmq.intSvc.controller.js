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

deleteInternalService = (req, res, next) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";
  var labelSelector = `app=rabbitmq-int-svc-${req.user.username}`;
  var serviceName = `rabbitmq-int-svc-${req.user.username}`;

  serviceExists(namespace, labelSelector).then((exists) => {
    if (exists == 1) {
      k8sApi
        .deleteNamespacedService(serviceName, namespace, pretty)
        .then((response) => {
          if (response.body.status == "Success") {
            next();
          } else {
            res.status(404).send({
              message: `Internal Service deletion API call failed. Error message: ${response.body.message}`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("Internal Service deletion error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 0) {
      res.status(404).send({
        message:
          "Internal Service deletion API call failed. No Internal Service exists for this user.",
      });
    } else {
      console.log("Error message: ", exists);
      res.status(500).send({ message: `Error message: ${exists}` });
    }
  });
};

internalServiceCreator = (req, res, next) => {
  var namespace = "default";

  internalServiceObject = {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
      name: `rabbitmq-int-svc-${req.user.username}`,
      labels: { app: `rabbitmq-int-svc-${req.user.username}` },
    },
    spec: {
      selector: { app: `rabbitmq-server-${req.user.username}` },
      type: "ClusterIP",
      ports: [{ port: 5672, targetPort: 5672 }],
    },
  };

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  k8sApi
    .createNamespacedService(namespace, internalServiceObject)
    .then((response) => {
      // console.log(
      //   "\nThe Internal-Service-creation API response.body is: ",
      //   response.body
      // );
      next();
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      console.log("RabbitMQ internal service creation error", err);
      // ProcessingInstruction.exit(); // I don't know what this does
      return;
    });
};

const rmqIntService = { internalServiceCreator, deleteInternalService };

module.exports = rmqIntService;
