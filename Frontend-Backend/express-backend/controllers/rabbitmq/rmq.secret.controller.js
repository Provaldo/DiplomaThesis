const k8s = require("@kubernetes/client-node");

const secretExists = async (namespace, labelSelector) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";

  try {
    var apiResponse = await k8sApi.listNamespacedSecret(
      namespace,
      pretty,
      undefined,
      undefined,
      undefined,
      labelSelector
    );

    if (apiResponse.body.items.length == 0) {
      // console.log("No secrets found");
      return 0;
    } else {
      // console.log("Secret found");
      return 1;
    }
  } catch (err) {
    console.log("RabbitMQ-credentials secret list error", err);
    // ProcessingInstruction.exit(); // I don't know what this does
    return err;
  }
};

deleteRMQSecret = (req, res, next) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";
  var labelSelector = `tag=rmq-credentials-${req.user.username}-secret`;
  var secretName = `rmq-credentials-${req.user.username}-secret`;

  secretExists(namespace, labelSelector).then((exists) => {
    if (exists == 1) {
      k8sApi
        .deleteNamespacedSecret(secretName, namespace, pretty)
        .then((response) => {
          if (response.body.status == "Success") {
            next();
          } else {
            res.status(404).send({
              message: `RMQ-credentials secret API call failed. Error message: ${response.body.message}`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("RMQ-credentials secret deletion error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 0) {
      res.status(404).send({
        message:
          "RMQ-credentials secret deletion API call failed. No RMQ-credentials secret exists for this user.",
      });
    } else {
      console.log("Error message: ", exists);
      res.status(500).send({ message: `Error message: ${exists}` });
    }
  });
};

const toBase64 = (str) => {
  // creating a buffer
  const buff = Buffer.from(str, "utf-8");

  // decoding buffer as Base64
  const base64 = buff.toString("base64");

  // console.log("Base64 string: ", base64)
  return base64;
};

secretCreator = (req, res, next) => {
  var namespace = "default";

  const username = toBase64(req.body.rmq_username);
  const password = toBase64(req.body.rmq_password);

  secretObject = {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: `rmq-credentials-${req.user.username}-secret`,
      labels: {
        app: `rmq-credentials-${req.user.username}-secret`,
        tag: `rmq-credentials-${req.user.username}-secret`,
      },
    },
    type: "Opaque",
    data: {
      "rmq-credentials-username": username,
      "rmq-credentials-password": password,
    },
  };

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  k8sApi
    .createNamespacedSecret(namespace, secretObject)
    .then((response) => {
      //   console.log("The Secret-creation API response.body is: ", response.body);
      // remove the credentials from further communications
      req.body.rmq_username = "";
      req.body.rmq_password = "";
      next();
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      console.log("RabbitMQ-credentials secret creation error", err);
      // ProcessingInstruction.exit(); // I don't know what this does
      return;
    });
};

const rmqSecret = { secretCreator, deleteRMQSecret };

module.exports = rmqSecret;
