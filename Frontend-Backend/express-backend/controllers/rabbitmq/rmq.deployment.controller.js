const k8s = require("@kubernetes/client-node");

const serverExists = async (namespace, username) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

  var pretty = "true";
  var labelSelector = `tag=rabbitmq-${username}`;

  try {
    var apiResponse = await k8sApi.listNamespacedDeployment(
      namespace,
      pretty,
      undefined,
      undefined,
      undefined,
      labelSelector
    );

    if (apiResponse.body.items.length == 0) {
      // console.log("No servers found");
      return 0;
    } else {
      // console.log("Server found");
      return 1;
    }
  } catch (err) {
    console.log("RabbitMQ deployment list error", err);
    // ProcessingInstruction.exit(); // I don't know what this does
    return err;
  }
};

deleteRMQServerDeployment = (req, res, next) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

  var pretty = "true";
  var deploymentName = `rabbitmq-${req.user.username}`;

  serverExists(namespace, req.user.username).then((exists) => {
    if (exists == 1) {
      k8sApi
        .deleteNamespacedDeployment(deploymentName, namespace, pretty)
        .then((response) => {
          if (response.body.status == "Success") {
            next();
          } else {
            res.status(404).send({
              message: `Deployment deletion API call failed. Error message: ${response.body.message}`,
            });
          }
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("RabbitMQ deployment deletion error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 0) {
      res.status(404).send({
        message:
          "Deployment deletion API call failed. No RabbitMQ server exists for this user.",
      });
    } else {
      console.log("Error message: ", exists);
      res.status(500).send({ message: `Error message: ${exists}` });
    }
  });
};

deploymentCreator = (req, res, next) => {
  var namespace = "default";

  var deploymentObject = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: `rabbitmq-${req.user.username}`,
      labels: {
        app: "rabbitmq-server",
        tag: `rabbitmq-${req.user.username}`,
        owner: req.user.username,
      },
    },
    spec: {
      selector: {
        matchLabels: { app: `rabbitmq-server-${req.user.username}` },
      },
      template: {
        metadata: {
          name: `rabbitmq-${req.user.username}`,
          labels: { app: `rabbitmq-server-${req.user.username}` },
        },
        spec: {
          containers: [
            {
              name: `rabbitmq-${req.user.username}`,
              // image: "rabbitmq:3-management",
              image: "rabbitmq:3-management-alpine",
              imagePullPolicy: "IfNotPresent",
              ports: [
                { containerPort: 5672, name: "amqp" },
                { containerPort: 15672, name: "management" },
              ],
              env: [
                {
                  // Setting the default user and password
                  name: "RABBITMQ_DEFAULT_USER",
                  // value: req.body.rmq_username,
                  valueFrom: {
                    secretKeyRef: {
                      name: `${req.user.username}-credentials-secret`,
                      key: "username",
                    },
                  },
                },
                {
                  name: "RABBITMQ_DEFAULT_PASS",
                  // value: req.body.rmq_password,
                  valueFrom: {
                    secretKeyRef: {
                      name: `${req.user.username}-credentials-secret`,
                      key: "password",
                    },
                  },
                },
                // // Setting default vhost
                // RABBITMQ_DEFAULT_VHOST: "",
                // // RabbitMQ config file
                // RABBITMQ_CONFIG_FILE: "/config/rabbitmq", // THIS IS AN EXMAPLE. NEEDS TO POINT TO THE CONFIG FILE ON THE BACKEND CONTAINER
                // // SSL configuration using the management plugin
                // RABBITMQ_MANAGEMENT_SSL_CACERTFILE: "",
                // RABBITMQ_MANAGEMENT_SSL_CERTFILE: "",
                // RABBITMQ_MANAGEMENT_SSL_DEPTH: "",
                // RABBITMQ_MANAGEMENT_SSL_FAIL_IF_NO_PEER_CERT: "",
                // RABBITMQ_MANAGEMENT_SSL_KEYFILE: "",
                // RABBITMQ_MANAGEMENT_SSL_VERIFY: "",
              ],
              // resources: { limits: { memory: "128Mi", cpu: "500m" } },
              // volumes: [{name: ""}]
            },
          ],
        },
      },
      // replicas: 1,
    },
  };

  var statefulSetObject = {
    apiVersion: "apps/v1",
    kind: "StatefulSet",
    metadata: {
      name: `rabbitmq-${req.user.username}`,
      labels: { app: "rabbitmq-server" },
    },
    spec: {
      selector: {
        matchLabels: { app: `rabbitmq-server-${req.user.username}` },
      },
      template: {
        metadata: {
          name: `rabbitmq-${req.user.username}`,
          labels: { app: `rabbitmq-server-${req.user.username}` },
        },
        spec: {
          serviceAccountName: "backend-serviceAccount",
          containers: [
            {
              name: `rabbitmq-${req.user.username}`,
              // image: "rabbitmq:3-management",
              image: "rabbitmq:3-management-alpine",
              imagePullPolicy: "IfNotPresent",
              ports: [
                { containerPort: 5672, name: "amqp" },
                { containerPort: 15672, name: "management" },
              ],
              env: [
                {
                  // Setting the default user and password
                  RABBITMQ_DEFAULT_USER: req.user.username,
                  RABBITMQ_DEFAULT_PASS: "1234", // NEEDS TO BE CHANGED ASAP
                  // Setting default vhost
                  RABBITMQ_DEFAULT_VHOST: "",
                  // SSL configuration using the management plugin
                  RABBITMQ_MANAGEMENT_SSL_CACERTFILE: "",
                  RABBITMQ_MANAGEMENT_SSL_CERTFILE: "",
                  RABBITMQ_MANAGEMENT_SSL_DEPTH: "",
                  RABBITMQ_MANAGEMENT_SSL_FAIL_IF_NO_PEER_CERT: "",
                  RABBITMQ_MANAGEMENT_SSL_KEYFILE: "",
                  RABBITMQ_MANAGEMENT_SSL_VERIFY: "",
                },
              ],
              // resources: { limits: { memory: "128Mi", cpu: "500m" } },
            },
          ],
        },
      },
      // replicas: 1,
    },
  };

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

  serverExists(namespace, req.user.username).then((exists) => {
    if (exists == 0) {
      k8sApi
        .createNamespacedDeployment(namespace, deploymentObject)
        .then((response) => {
          // console.log(
          //   "The RMQ-Server Deployment-creation API response.body is: ",
          //   response.body
          // );
          const {
            name: deploymentName,
            creationTimestamp,
            labels,
            namespace: ns,
            uid: id,
          } = response.body.metadata;
          req.rabbitmqServer = {
            deploymentName,
            creationTimestamp,
            labels,
            ns,
            id,
          };
          next();
        })
        .catch((err) => {
          res.status(500).send({ message: err });
          console.log("RabbitMQ deployment creation error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 1) {
      res.status(409).send({
        message:
          "Deployment creation API call failed. RabbitMQ server already exists for this user.",
      });
    } else {
      res.status(500).send({ message: exists });
    }
  });
};

const rmqDeployment = { deploymentCreator, deleteRMQServerDeployment };

module.exports = rmqDeployment;
