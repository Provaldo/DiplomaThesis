const amqp = require("amqplib/callback_api");
const rmqConfig = require("../config/rmq.config");

const dbConfig = require("../config/db.config");
// const MongoClient = require("mongodb").MongoClient;

amqp.connect(
  `amqp://${rmqConfig.RMQ_USERNAME}:${rmqConfig.RMQ_PASSWORD}@${rmqConfig.RMQ_SERVER}:${rmqConfig.RMQ_PORT}`,
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
      var exchange = rmqConfig.RMQ_CONSUMER_NAME;
      // test
      channel.assertExchange(exchange, "topic", { durable: true });

      channel.assertQueue(queue, {
        // this means that the queue will survive a RabbitMQ node restart. we also need to mark the messages as durable.
        durable: true,
        // When the connection that declared it closes, the queue will be deleted because it is declared as exclusive.
        exclusive: true,
      });

      // This tells RabbitMQ not to give more than one message to a worker at a time.
      // Or, in other words, don't dispatch a new message to a worker until it has
      // processed and acknowledged the previous one. Instead, it will dispatch it
      // to the next worker that is not still busy.
      channel.prefetch(1);

      // test
      channel.bindQueue(queue, exchange, rmqConfig.RMQ_TOPIC);

      console.log(
        " [*] Waiting for messages in %s. To exit press CTRL+C",
        queue
      );

      channel.consume(
        queue,
        function (msg) {
          console.log(" [x] Received %s", msg.content.toString());
          channel.ack(msg); // this is how the consumer acknowledges that the message has been handled properly
        },
        {
          noAck: false, // the consumer needs to acknowledge that the message has been handled for rmq server to delete the msg from the queue
        }
      );
    });
  }
);
console.log("Consumer created");
