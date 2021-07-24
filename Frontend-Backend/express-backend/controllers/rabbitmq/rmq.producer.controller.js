var amqp = require("amqplib/callback_api");

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
    // "amqp://guest:guest@rabbitmq:5672",
    `amqp://${req.user.username}:${req.body.producerPassword}@rabbitmq-int-svc-${req.user.username}:5672`,
    function (error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function (error1, channel) {
        if (error1) {
          throw error1;
        }

        // console.log(req.body.rmqProducerMessageObject);
        // var msg = { temp: 30, distance: 1000, severity: "critical" };
        // var msg = JSON.parse(req.body.rmqProducerMessageObject);
        var msg = req.body.rmqProducerMessageObject;

        // var exchange = "test";
        var exchange = req.body.rmqProducerExchangeName;

        // var key = "orange.critical";
        var key = req.body.rmqProducerTopic;

        // test
        channel.assertExchange(exchange, "topic", {
          durable: true,
        });

        // The producer not asserting a queue means that if a consumer hasn't already
        // been created to assert their own queue and bind it to the exchange, then
        // all messages sent to the exchange will be lost.

        channel.publish(exchange, key, Buffer.from(JSON.stringify(msg)), {});

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
