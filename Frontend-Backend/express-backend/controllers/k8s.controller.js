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
    console.log("Auth-credentials secret list error", err);
    // ProcessingInstruction.exit(); // I don't know what this does
    return err;
  }
};

deleteAuthSecret = (req, res, next) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";
  var labelSelector = `tag=${req.body.username}-credentials-secret`;
  var secretName = `${req.body.username}-credentials-secret`;

  secretExists(namespace, labelSelector).then((exists) => {
    if (exists == 1) {
      k8sApi
        .deleteNamespacedSecret(secretName, namespace, pretty)
        .then((response) => {
          if (response.body.status == "Success") {
            next();
          } else {
            res.status(404).send({
              message: `Auth-credentials secret API call failed. Error message: ${response.body.message}`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("Auth-credentials secret deletion error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 0) {
      res.status(404).send({
        message:
          "Auth-credentials secret deletion API call failed. No Auth-credentials secret exists for this user.",
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

createAuthSecret = (req, res, next) => {
  var namespace = "default";

  const username = toBase64(req.body.username);
  const password = toBase64(req.body.password);

  secretObject = {
    apiVersion: "v1",
    kind: "Secret",
    metadata: {
      name: `${req.body.username}-credentials-secret`,
      labels: {
        app: `${req.body.username}-credentials-secret`,
        tag: `${req.body.username}-credentials-secret`,
      },
    },
    type: "Opaque",
    data: {
      username: username,
      password: password,
    },
  };

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var labelSelector = `tag=${req.body.username}-credentials-secret`;

  secretExists(namespace, labelSelector).then((exists) => {
    if (exists == 0) {
      k8sApi
        .createNamespacedSecret(namespace, secretObject)
        .then((response) => {
          //   console.log("The Secret-creation API response.body is: ", response.body);
          next();
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("Auth-credentials secret creation error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 1) {
      res.status(404).send({
        message:
          "Auth-credentials secret creation API call failed. Auth-credentials secret already exists for this user.",
      });
    } else {
      console.log("Error message: ", exists);
      res.status(500).send({ message: `Error message: ${exists}` });
    }
  });
};

const authSecret = { createAuthSecret, deleteAuthSecret };

module.exports = authSecret;
