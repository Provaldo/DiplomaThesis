const k8s = require("@kubernetes/client-node");
const axios = require("axios").default;

const consumerExists = async (namespace, username, consumerName) => {
  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

  var pretty = "true";
  var labelSelector = `tag=consumer-${username}-${consumerName}`;

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
    console.log("Consumer deployment list error", err);
    // ProcessingInstruction.exit(); // I don't know what this does
    return err;
  }
};

deleteConsumerDeployment = (req, res, next) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

  var pretty = "true";
  var deploymentName = `consumer-${req.user.username}-${req.body.rmqConsumerName}`;

  consumerExists(namespace, req.user.username, req.body.rmqConsumerName).then(
    (exists) => {
      if (exists == 1) {
        k8sApi
          .deleteNamespacedDeployment(deploymentName, namespace, pretty)
          .then((response) => {
            if (response.body.status == "Success") {
              next();
            } else {
              res.status(404).send({
                message: `Consumer deployment deletion API call failed. Error message: ${response.body.message}`,
              });
            }
          })
          .catch((err) => {
            res.status(500).send({ message: err });
            console.log("Consumer deployment deletion error", err);
            // ProcessingInstruction.exit(); // I don't know what this does
            return;
          });
      } else if (exists == 0) {
        res.status(404).send({
          message:
            "Deployment deletion API call failed. No Consumer exists for this user.",
        });
      } else {
        console.log("Error message: ", exists);
        res.status(500).send({ message: `Error message: ${exists}` });
      }
    }
  );
};

createConsumerDeployment = (req, res, next) => {
  var namespace = "default";

  var deploymentObject = {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
      name: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
      labels: {
        app: "consumer",
        owner: req.user.username,
        tag: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
      },
    },
    spec: {
      selector: {
        matchLabels: {
          app: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
        },
      },
      template: {
        metadata: {
          name: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
          labels: {
            app: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
          },
        },
        spec: {
          containers: [
            {
              name: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
              image: "provaldo/dipl-consumer:k8s",
              imagePullPolicy: "Always",
              //   ports: [
              //     { containerPort: 5672, name: "amqp" },
              //     { containerPort: 15672, name: "management" },
              //   ],
              env: [
                {
                  // Setting the rabbitmq server access credentials
                  name: "AUTH_USERNAME",
                  value: `${req.user.username}`,
                },
                {
                  name: "AUTH_PASSWORD",
                  value: `${req.body.consumerPassword}`,
                },
                {
                  name: "RMQ_SERVER",
                  value: `rabbitmq-int-svc-${req.user.username}`,
                },
                {
                  name: "RMQ_PORT",
                  value: "5672",
                },
                {
                  name: "RMQ_CONSUMER_NAME",
                  value: req.body.rmqConsumerName,
                },
                {
                  name: "RMQ_EXCHANGE_NAME",
                  value: req.body.rmqExchangeName,
                },
                {
                  name: "RMQ_QUEUE_NAME",
                  value: req.body.rmqQueueName,
                },
                {
                  name: "RMQ_ROUTING_KEY",
                  value: req.body.rmqRoutingKey,
                },
                {
                  name: "RMQ_LOGGING_CONDITIONS",
                  value: req.body.rmqLoggingConditions,
                },
                {
                  name: "DB_SERVER",
                  valueFrom: {
                    configMapKeyRef: {
                      name: "mongodb-configmap",
                      key: "database_url",
                    },
                  },
                },
                {
                  name: "DB_PORT",
                  value: "27017",
                },
                {
                  name: "DB_DBNAME",
                  value: `${req.user.username}`,
                },
              ],
              // resources: {
              //   limits: { memory: "128Mi", cpu: "1000m" },
              //   requests: { memory: "48Mi", cpu: "500m" },
              // },
              // volumes: [{name: ""}]
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

  consumerExists(namespace, req.user.username, req.body.rmqConsumerName).then(
    (exists) => {
      if (exists == 0) {
        k8sApi
          .createNamespacedDeployment(namespace, deploymentObject)
          .then((response) => {
            // console.log(
            //   "The Consumer Deployment-creation API response.body is: ",
            //   response.body
            // );
            const {
              name: deploymentName,
              labels,
              namespace: ns,
              creationTimestamp,
            } = response.body.metadata;

            const loggingConditions = JSON.parse(
              req.body.rmqLoggingConditions
            ).map((item) => {
              return {
                variable: item.variable,
                operator: item.operator,
                value: item.value,
              };
            });

            req.consumer = {
              deploymentName,
              labels,
              podName: "",
              name: req.body.rmqConsumerName,
              ns,
              creationTimestamp,
              exchangeName: req.body.rmqExchangeName,
              queueName: req.body.rmqQueueName,
              routingKey: req.body.rmqRoutingKey,
              loggingConditions,
            };

            req.body.consumerPassword = "";
            next();
          })
          .catch((err) => {
            res.status(500).send({ message: err });
            console.log("Consumer deployment creation error", err);
            // ProcessingInstruction.exit(); // I don't know what this does
            return;
          });
      } else if (exists == 1) {
        res.status(409).send({
          message:
            "Deployment creation API call failed. RabbitMQ consumer with given name already exists for this user.",
        });
      } else {
        res.status(500).send({ message: exists });
      }
    }
  );
};

const rmqConsumer = {
  createConsumerDeployment,
  deleteConsumerDeployment,
};

module.exports = rmqConsumer;
