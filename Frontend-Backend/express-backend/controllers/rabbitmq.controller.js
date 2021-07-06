var amqp = require("amqplib/callback_api");
const k8s = require("@kubernetes/client-node");
const { V1ReplicationController } = require("@kubernetes/client-node");

// import { connect } from "amqplib/callback_api";
// import { KubeConfig, AppsV1Api, CoreV1Api } from "@kubernetes/client-node";

const serverExists = async (namespace, username) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

  var pretty = "true";
  var labelSelector = `owner=${username}`;

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

exports.deleteRMQServerDeployment = (req, res, next) => {
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

exports.deploymentCreator = (req, res, next) => {
  var namespace = "default";

  var deploymentObject = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: `rabbitmq-${req.user.username}`,
      labels: { app: "rabbitmq-server", owner: req.user.username },
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
                  value: req.body.rmq_username,
                },
                {
                  name: "RABBITMQ_DEFAULT_PASS",
                  value: req.body.rmq_password,
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
          //   "The Deployment-creation API response.body is: ",
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
      res.status(404).send({
        message:
          "Deployment creation API call failed. RabbitMQ server already exists for this user.",
      });
    } else {
      res.status(500).send({ message: exists });
    }
  });
};

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

exports.deleteInternalService = (req, res, next) => {
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

exports.internalServiceCreator = (req, res, next) => {
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

exports.deleteExternalService = (req, res, next) => {
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

exports.externalServiceCreator = (req, res, next) => {
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

exports.userRequestProducer = (req, res) => {
  // VERSION 1
  // amqp.connect(
  // "amqp://guest:guest@192.168.49.2:30672",
  // VERSION 2
  // amqp.connect(
  //   "amqp://" +
  //     rabbit_user +
  //     ":" +
  //     rabbit_password +
  //     "@" +
  //     rabbit_host +
  //     ":" +
  //     rabbit_port +
  //     "/",
  // VERSION 3
  //   amqp.connect({
  //     protocol: process.env.RABBITMQ_PROTOCOL,
  //     hostname: process.env.RABBITMQ_HOST,
  //     port: process.env.RABBITMQ_PORT,
  //     username: process.env.RABBITMQ_USER,
  //     password: process.env.RABBITMQ_PASSWORD,
  //     vhost: process.env.RABBITMQ_VHOST
  // },
  // function (error0, connection) {
  // VERSION 4
  // amqp.connect("amqp://localhost", function (error0, connection) {
  // VERSION 5
  amqp.connect(
    "amqp://guest:guest@rabbitmq:5672",
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        var queue = "hello";
        var msg = "Hello World!";
        // test
        var exchange = "test_exg";
        var args = process.argv.slice(2);
        var key = args[0];

        // test
        channel.assertExchange(exchange, "topic", {
          durable: false,
        });

        channel.assertQueue(queue, {
          durable: false,
        });

        // test
        channel.bindQueue(queue, exchange, "#");
        channel.publish(exchange, key, Buffer.from(JSON.stringify(msg)), {
          correlationId: "correlationId",
          replyTo: "q.queue",
        });

        // to restore
        // channel.sendToQueue(queue, Buffer.from(msg));

        console.log(" [x] Sent %s", msg);
      });
      setTimeout(function () {
        connection.close();
        // process.exit(0);
      }, 500);
    }
  );
  res.status(200).send({ message: "Producer created." });
};

exports.userRequestConsumer = (req, res) => {
  amqp.connect(
    "amqp://guest:guest@rabbitmq:5672",
    function (error0, connection) {
      // amqp.connect(
      //   "amqp://guest:guest@192.168.49.2:30672",
      //   function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        var queue = "hello";

        // test
        var exchange = "test_exg";
        // test
        channel.assertExchange(exchange, "topic", { durable: false });

        channel.assertQueue(queue, {
          durable: false,
        });

        // test
        channel.bindQueue(queue, exchange, "#");

        console.log(
          " [*] Waiting for messages in %s. To exit press CTRL+C",
          queue
        );

        channel.consume(
          queue,
          function (msg) {
            console.log(" [x] Received %s", msg.content.toString());
          },
          {
            noAck: true,
          }
        );
      });
    }
  );
  res.status(200).send({ message: "Consumer created." });
};
