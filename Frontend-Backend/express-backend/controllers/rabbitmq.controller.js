var amqp = require("amqplib/callback_api");

// import { connect } from "amqplib/callback_api";
// import { KubeConfig, AppsV1Api, CoreV1Api } from "@kubernetes/client-node";

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
