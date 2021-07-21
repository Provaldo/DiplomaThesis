const amqp = require("amqplib/callback_api");
const rmqConfig = require("../config/rmq.config");
const dbConfig = require("../config/db.config");
const authConfig = require("../config/auth.config");
const db = require("../models");
const { recordMessage } = require("../controllers/db.controller");
// const MongoClient = require("mongodb").MongoClient;

db.mongoose
  .connect(
    // `mongodb://${dbConfig.DB_USERNAME}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_SERVER}:${dbConfig.PORT}/${dbConfig.DB}`,
    `mongodb://${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}/${dbConfig.DB_DBNAME}`, // Afto leitourgei stin ylopoihsh tis DB eite ws Deployment, eite ws StatefulSet. Apla prepei na allazei to mongo-configmap.yaml
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: { authSource: dbConfig.DB_DBNAME },
      user: authConfig.USERNAME,
      pass: authConfig.PASSWORD,
    }
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

amqp.connect(
  `amqp://${authConfig.USERNAME}:${authConfig.PASSWORD}@${rmqConfig.RMQ_SERVER}:${rmqConfig.RMQ_PORT}`,
  function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }

      // test
      var exchange = rmqConfig.RMQ_EXCHANGE_NAME;
      // test
      channel.assertExchange(exchange, "topic", { durable: true });

      channel.assertQueue(
        "",
        {
          // this means that the queue will survive a RabbitMQ node restart. we also need to mark the messages as durable.
          durable: true,
          // When the connection that declared it closes, the queue will be deleted because it is declared as exclusive.
          exclusive: true,
        },
        function (error2, q) {
          if (error2) {
            throw error2;
          }

          console.log(
            ` [*] Consumer ${rmqConfig.RMQ_CONSUMER_NAME}. Waiting for messages in %s.`,
            q
          );

          // This tells RabbitMQ not to give more than one message to a worker at a time.
          // Or, in other words, don't dispatch a new message to a worker until it has
          // processed and acknowledged the previous one. Instead, it will dispatch it
          // to the next worker that is not still busy.
          channel.prefetch(1);

          // test
          channel.bindQueue(q.queue, exchange, rmqConfig.RMQ_ROUTING_KEY);

          channel.consume(
            q.queue,
            function (msg) {
              console.log(" [x] Received %s", msg.content.toString());
              // console.log("Message object is: ", msg);
              // console.log(
              //   "Message content is: ",
              //   JSON.parse(msg.content.toString())
              // );

              var messageContent = JSON.parse(msg.content.toString());

              var parsedLoggingConditions = JSON.parse(
                rmqConfig.RMQ_LOGGING_CONDITIONS
              );

              // The some() method tests whether at least one element in the array passes the
              // test implemented by the provided function. It returns true if, in the array,
              // it finds an element for which the provided function returns true; otherwise it
              // returns false. It doesn't modify the array.
              parsedLoggingConditions.some((condition, index) => {
                let variable = condition.variable;
                let operator = condition.operator;
                let value = condition.value;

                let loggingConditionSatisfied = false;

                if (messageContent.hasOwnProperty(variable)) {
                  switch (operator) {
                    case "=":
                      if (messageContent[variable] == value) {
                        loggingConditionSatisfied = true;
                      }
                    case ">":
                      if (messageContent[variable] > value) {
                        loggingConditionSatisfied = true;
                      }
                    case "<":
                      if (messageContent[variable] < value) {
                        loggingConditionSatisfied = true;
                      }
                    case "!=":
                      if (messageContent[variable] != value) {
                        loggingConditionSatisfied = true;
                      }
                    case ">=":
                      if (messageContent[variable] >= value) {
                        loggingConditionSatisfied = true;
                      }
                    case "<=":
                      if (messageContent[variable] <= value) {
                        loggingConditionSatisfied = true;
                      }
                  }

                  if (loggingConditionSatisfied) {
                    recordMessage(condition, msg, q.messageCount);
                  }
                } else {
                  console.log(
                    "Message disregarded. No matching message property to logging conditions found."
                  );
                }
                return loggingConditionSatisfied;
              });
              channel.ack(msg); // this is how the consumer acknowledges that the message has been handled properly
            },
            {
              noAck: false, // the consumer needs to acknowledge that the message has been handled for rmq server to delete the msg from the queue
            }
          );
        }
      );
    });
  }
);
console.log("Consumer created");
