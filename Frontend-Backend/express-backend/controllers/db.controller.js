const MongoClient = require("mongodb").MongoClient;
const db = require("../models");
const User = db.user;
const test = require("assert");
const mongoose = require("mongoose");
const dbConfig = require("../config/db.config");

exports.signup = (req, res, next) => {
  const url = `mongodb://${dbConfig.DB_USERNAME}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}`;

  MongoClient.connect(
    url,
    {
      useUnifiedTopology: true,
    },
    function (err, client) {
      if (err) {
        res.status(500).send({ message: err });
        console.log("Connection error", err);
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      }

      client
        .db(req.body.username)
        .addUser(
          req.body.username,
          req.body.password,
          { roles: [{ role: "readWrite", db: req.body.username }] },
          function (err, result) {
            if (err) {
              res.status(500).send({ message: err });
              console.log(`User "${req.body.username}" creation error: `, err);
              // ProcessingInstruction.exit(); // I don't know what this does
              return;
            }

            // remove the password from further communications
            req.body.password = "";

            // res
            //   .status(200)
            //   .send({ message: "User was registered successfully!" });

            client.close();
            next();
          }
        );
    }
  );
};

exports.registerRMQServer = (req, res, next) => {
  var rabbitmqServer = {
    deploymentName: req.rabbitmqServer.deploymentName,
    labels: req.rabbitmqServer.labels,
    podName: "",
    creationTimestamp: req.rabbitmqServer.creationTimestamp,
    id: req.rabbitmqServer.id,
    namespace: req.rabbitmqServer.ns,
    addressIP: req.rabbitmqServer.IP,
    managementAddressNodePort: req.rabbitmqServer.mngmntNodePort,
    managementAddressPort: req.rabbitmqServer.mngmntPort,
    managementAddressPortName: req.rabbitmqServer.mngmntPortName,
    amqpAddressNodePort: req.rabbitmqServer.amqpNodePort,
    amqpAddressPort: req.rabbitmqServer.amqpPort,
    amqpAddressPortName: req.rabbitmqServer.amqpPortName,
  };

  User.findOneAndUpdate(
    { username: req.body.username },
    {
      rabbitmqServer: rabbitmqServer,
    },
    { new: true, runValidators: true, useFindAndModify: false },
    (err, doc) => {
      if (err) {
        res.status(500).send({ message: err });
        console.log(
          "DB error while updating RMQServer info in user's document: ",
          err
        );
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      } else {
        // console.log("Updated DB document: ", doc);
        res.status(200).send({
          message:
            "RabbitMQ Server and related Services were created successfully. DB updated.",
          serverData: rabbitmqServer,
        });
        // next();
      }
    }
  );
};

exports.removeRMQServer = (req, res) => {
  User.findByIdAndUpdate(
    req.session.userId,
    {
      rabbitmqServer: {},
    },
    { new: true, runValidators: true, useFindAndModify: false },
    (err, doc) => {
      if (err) {
        res.status(500).send({ message: err });
        console.log(
          "DB error while updating RMQServer info in user's document: ",
          err
        );
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      } else {
        // console.log("Updated DB document: ", doc);
        res.status(200).send({
          message:
            "RabbitMQ Server and related Services were deleted successfully. DB updated.",
        });
      }
    }
  );
};

exports.registerConsumer = (req, res) => {
  User.findByIdAndUpdate(
    req.session.userId,
    {
      $addToSet: { consumers: req.consumer },
    },
    { new: true, runValidators: true, useFindAndModify: false },
    (err, doc) => {
      if (err) {
        res.status(500).send({ message: err });
        console.log(
          "DB error while updating RQM Consumer info in user's document: ",
          err
        );
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      } else {
        // console.log("Updated DB document: ", doc);
        res.status(200).send({
          message: "RabbitMQ Consumer was created successfully. DB updated.",
          consumerData: req.consumer,
        });
      }
    }
  );
};

exports.removeConsumer = (req, res) => {
  User.findByIdAndUpdate(
    req.session.userId,
    {
      $pull: {
        consumers: {
          deploymentName: `consumer-${req.user.username}-${req.body.rmqConsumerName}`,
        },
      },
    },
    { new: true, runValidators: true, useFindAndModify: false },
    (err, doc) => {
      if (err) {
        res.status(500).send({ message: err });
        console.log(
          "DB error while updating RMQ Consumer info in user's document: ",
          err
        );
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      } else {
        // console.log("Updated DB document: ", doc);
        res.status(200).send({
          message: "RabbitMQ Consumer was deleted successfully. DB updated.",
          consumerName: req.body.rmqConsumerName,
        });
      }
    }
  );
};

exports.updateOverviewDataOnDB = (userId, overviewData) => {
  User.findByIdAndUpdate(
    userId,
    {
      $set: {
        overviewData: overviewData,
      },
    },
    { new: true, runValidators: true, useFindAndModify: false },
    (err, doc) => {
      if (err) {
        // res.status(500).send({ message: err });
        console.log(
          "DB error while updating Overview data in user's document: ",
          err
        );
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      } else {
        // console.log("Updated DB document: ", doc);
        // res.status(200).send({
        //   message:
        //     "RabbitMQ Server and related Services were created successfully. DB updated.",
        //   serverData: rabbitmqServer,
        // });
        // next();
      }
    }
  );
};

// exports.getConsumerAcceptedMessages2 = (req, res) => {
//   const url = `mongodb://${dbConfig.DB_USERNAME}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}/`;

//   MongoClient.connect(
//     url,
//     {
//       useUnifiedTopology: true,
//     },
//     function (err, client) {
//       if (err) {
//         res.status(500).send({ message: err });
//         console.log("Connection error", err);
//         // ProcessingInstruction.exit(); // I don't know what this does
//         return;
//       }
//       // { consumerName: req.body.consumerName }

//       // let collection = db.collection("messages");

//       client
//         .db(req.body.username)
//         .collection("messages")
//         .find({ consumerName: req.body.consumerName })
//         .toArray((err, result) => {
//           if (err) {
//             // res.status(500).send({ message: err });
//             console.log(
//               `DB error while getting consumer ${req.body.consumerName} messages `,
//               err
//             );
//             // ProcessingInstruction.exit(); // I don't know what this does
//             return;
//           } else {
//             console.log(
//               `DB function successfull. Messages of consumer ${req.body.consumerName} returned`,
//               result
//             );
//             res.status(200).send({
//               message: `DB function successfull. Messages of consumer ${req.body.consumerName} returned`,
//               messages: result,
//             });
//           }

//           client.close();
//         });
//     }
//   );
// };

exports.getConsumerAcceptedMessages = async (req, res) => {
  const conn = await mongoose.createConnection(
    `mongodb://${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}/${req.user.username}`, // Afto leitourgei stin ylopoihsh tis DB eite ws Deployment, eite ws StatefulSet. Apla prepei na allazei to mongo-configmap.yaml
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: { authSource: "admin" },
      user: dbConfig.DB_USERNAME,
      pass: dbConfig.DB_PASSWORD,
    }
  );
  // .then(() => {
  //   console.log(
  //     "Successfully connect to MongoDB, database: ",
  //     req.user.username
  //   );
  // })
  // .catch((err) => {
  //   console.error("Connection error", err);
  //   res.status(500).send({ message: "DB Connection error" });
  // });

  const Message = conn.model(
    "Message",
    new mongoose.Schema(
      {
        consumerName: String,
        exchangeName: String,
        queueName: String,
        content: Object,
        serialNumber: Number,
        routingKey: String,
        bindingKey: String,
        producedAt: Number,
        receivedAt: Number,
        conditionMet: Object,
      },
      {
        timestamps: true,
      }
    )
  );

  await Message.find({ consumerName: req.body.consumerName }, (err, docs) => {
    if (err) {
      res.status(500).send({ message: err });
      console.log(
        `DB error while getting consumer ${req.body.consumerName} messages `,
        err
      );
      // ProcessingInstruction.exit(); // I don't know what this does
      return;
    } else {
      // console.log(
      //   `DB function successfull. Messages of consumer ${req.body.consumerName} returned`,
      //   docs
      // );
      res.status(200).send({
        message: `DB function successfull. Messages of consumer ${req.body.consumerName} returned`,
        messages: docs,
      });
    }
  });

  conn
    .close()
    .then(() => {
      console.log("Connection was closed grafecully");
    })
    .catch((err) => {
      console.log("Woops, a wild error has appeared: ", err);
    });
};

// exports.test = (req, res) => {
//   // Connection url
//   const url = `mongodb://${dbConfig.DB_USERNAME}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}`;

//   // Database Name
//   // const dbName = `${dbConfig.DB_DBNAME}`;

//   MongoClient.connect(
//     url,
//     {
//       useUnifiedTopology: true,
//     },
//     function (err, client) {
//       if (err) {
//         res.status(500).send({ message: err });
//         console.log("Connection error", err);
//         // ProcessingInstruction.exit(); // I don't know what this does
//         return;
//       }

//       console.log("successfully connected to MongoDB from testFunction");

//       client
//         .db("mple")
//         .addUser(
//           "mple",
//           "password",
//           { roles: [{ role: "readWrite", db: "mple" }] },
//           function (err, result) {
//             if (err) {
//               res.status(500).send({ message: err });
//               console.log('User "mple" creation error: ', err);
//               // ProcessingInstruction.exit(); // I don't know what this does
//             }

//             console.log('Successfully created user "mple": ', result);
//             res.status(200).send({ message: "ok" });

//             client.close();
//           }
//         );

// // Use the admin database for the operation

// const adminDb = client.db(dbName).admin();

// // List all the available databases

// adminDb.listDatabases(function (err, dbs) {
//   if (err) {
//     res.status(500).send({ message: err });
//     console.log("List Databases error", err);
//     // ProcessingInstruction.exit(); // I don't know what this does
//     return;
//   }

//   test.strictEqual(null, err);

//   test.ok(dbs.databases.length > 0);

//   console.log("Databases are: ", dbs);

//   // client.close();
// });

// Create a user on db admin with read access to test2 db

// adminDb.addUser(
//   "user2",
//   "password",
//   { roles: [{ role: "read", db: "test2" }] },
//   function (err, result) {
//     if (err) {
//       res.status(500).send({ message: err });
//       console.log("User2 creation error: ", err);
//       // ProcessingInstruction.exit(); // I don't know what this does
//     }

//     console.log("Successfully created user2: ", result);
//     res.status(200).send({ message: "ok" });
//     client.close();
//   }
// );
//     }
//   );
// };
