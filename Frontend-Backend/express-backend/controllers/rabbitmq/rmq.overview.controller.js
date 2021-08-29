const db = require("../../models");
const User = db.user;
const axios = require("axios").default;
const k8s = require("@kubernetes/client-node");
const dbController = require("../db.controller");

exposeConsumerIfExists = (req, res, next) => {
  User.findById(req.session.userId, (err, doc) => {
    if (err) {
      res.status(500).send({ message: err });
      console.log("DB error getting user's document: ", err);
      // ProcessingInstruction.exit(); // I don't know what this does
      return;
    } else {
      if (doc.consumers.length === 0) {
        // res.status(404).send({
        //   message:
        //     "Please create a filter/consumer for the live data to be generated.",
        // });
        let overviewData = doc.overviewData;
        const data = `data: ${JSON.stringify(overviewData)}\n\n`;
        res.write(data);
        return;
      } else {
        var namespace = "default";

        const kc = new k8s.KubeConfig();
        kc.loadFromDefault();
        const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

        var labelSelector = `app=consumer-overview-svc-${req.user.username}`;
        var serviceName = `consumer-overview-svc-${req.user.username}`;
        var consumerTag = `consumer-${req.user.username}-${doc.consumers[0].name}`;

        serviceExists(namespace, labelSelector).then((exists) => {
          if (exists == 1) {
            next();
          } else if (exists == 0) {
            internalServiceObject = {
              apiVersion: "v1",
              kind: "Service",
              metadata: {
                name: serviceName,
                labels: { app: serviceName },
              },
              spec: {
                selector: {
                  app: consumerTag,
                },
                type: "ClusterIP",
                ports: [{ port: 5000, targetPort: 5000 }],
              },
            };

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
                console.log("Consumer internal service creation error", err);
                // ProcessingInstruction.exit(); // I don't know what this does
                return;
              });
          } else {
            console.log("Error message: ", exists);
            res.status(500).send({ message: `Error message: ${exists}` });
          }
        });
      }
    }
  });
};

createStream = async (req, res) => {
  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
  };

  res.writeHead(200, headers);

  req.stopFlag = false;

  req.on("close", () => {
    console.log("Connection closed at: ", Date.now());
    req.stopFlag = true;
    return;
  });

  console.log("Starting to send");
  continuousSend(req, res);
};

const continuousSend = async (req, res) => {
  if (!req.stopFlag) {
    res.overviewData = await gatherOverviewData(req.user.username, res);
    // console.log("res.overviewData: ", res.overviewData);

    if (res.overviewData !== -1) {
      const data = `data: ${JSON.stringify(res.overviewData)}\n\n`;

      res.write(data);
      console.log("data chunk sent");

      setTimeout(() => continuousSend(req, res), 5000);
    }
  } else {
    deleteConsumerOverviewService(req.user.username);
    dbController.updateOverviewDataOnDB(req.session.userId, res.overviewData);
    return;
  }
};

const gatherOverviewData = async (username, res) => {
  try {
    const axiosRes = await axios.get(
      `http://consumer-overview-svc-${username}:5000/consumer/generateOverviewData`
    );
    if (axiosRes.statusText == "OK") {
      // console.log("axiosRes: ", axiosRes);
      // console.log("axiosRes.data", axiosRes.data);
      return axiosRes.data.overviewData;
    } else {
      // console.log("axiosRes is not ok: ", axiosRes);
      res.status(500).send({
        message:
          "Unkown error: Data generation request to consumer failed. " +
          axiosRes.body,
      });
      return -1;
    }
  } catch (err) {
    console.log("error: ", err);
    res.status(500).send({
      message:
        "Unkown error: Data generation request to consumer failed. " + err,
    });
    return -1;
  }
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
    console.log("K8s services list error", err);
    // ProcessingInstruction.exit(); // I don't know what this does
    return err;
  }
};

const deleteConsumerOverviewService = (username) => {
  namespace = "default";

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();
  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

  var pretty = "true";
  var labelSelector = `app=consumer-overview-svc-${username}`;
  var serviceName = `consumer-overview-svc-${username}`;

  serviceExists(namespace, labelSelector).then((exists) => {
    if (exists == 1) {
      k8sApi
        .deleteNamespacedService(serviceName, namespace, pretty)
        .then((response) => {
          if (response.body.status == "Success") {
            // next();
            return;
          } else {
            // res.status(404).send({
            //   message: `Internal Service deletion API call failed. Error message: ${response.body.message}`,
            // });
            console.log(
              `Consumer Overview Service deletion API call failed. Error message: ${response.body.message}`
            );
          }
        })
        .catch((err) => {
          // res.status(500).send({ message: err });
          console.log("Internal Service deletion error", err);
          // ProcessingInstruction.exit(); // I don't know what this does
          return;
        });
    } else if (exists == 0) {
      // res.status(404).send({
      //   message:
      //     "Internal Service deletion API call failed. No Internal Service exists for this user.",
      // });
      console.log(
        "Consumer Overview Service deletion API call failed. No Internal Service exists for this user."
      );
    } else {
      console.log("Error message: ", exists);
      // res.status(500).send({ message: `Error message: ${exists}` });
    }
  });
};

const rmqOverview = {
  exposeConsumerIfExists,
  createStream,
};

module.exports = rmqOverview;
