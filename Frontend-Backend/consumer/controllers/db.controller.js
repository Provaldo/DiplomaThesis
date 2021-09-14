const rmqConfig = require("../config/rmq.config");
const db = require("../models");
const Message = db.message;

exports.recordMessage = (condition, msg) => {
  const message = new Message({
    consumerName: rmqConfig.RMQ_CONSUMER_NAME,
    exchangeName: rmqConfig.RMQ_EXCHANGE_NAME,
    queueName: rmqConfig.RMQ_QUEUE_NAME,
    content: JSON.parse(msg.content.toString()),
    serialNumber: msg.fields.deliveryTag,
    topic: rmqConfig.RMQ_ROUTING_KEY, // THIS COULD BE REPLACED BY SOMETHING ELSE THAT WOULD LOG THE ACTUAL TOPIC OF THE SENT MESSAGE AND NOT THE ROUTING KEY
    producedAt: msg.properties.timestamp,
    receivedAt: Date.now(),
    conditionMet: condition,
  });

  message.save((err, message) => {
    if (err) {
      console.log("An error occurred while saving a message to the DB: ", err);
      return -1;
    } else {
      console.log("Message saved successfully to the DB. msg: ", message);
      return 1;
    }
  });
};

exports.gatherDBdata = async (timeframe) => {
  let timestampCompare = new Date(Date.now() - timeframe * 1000).toISOString();
  console.log("timestampCompare: ", timestampCompare);

  let temp = await Promise.all([
    Message.countDocuments(
      { createdAt: { $gt: timestampCompare } }
      // (err, count) => {
      //   if (!err) {
      //     let DBdata = {};
      //     console.log(
      //       "Number of documents inserted in this timeframe: ",
      //       count
      //     );
      //     DBdata.numberOfMessages = count;
      //     DBdata.messageInsertRate = count / timeframe;
      //     return count;
      // } else {
      //   console.log("DB query error: ", err);
      // }
      // }
    ),
    Message.estimatedDocumentCount(),
  ]);

  let timeframeDocs = temp[0];
  let allDocs = temp[1];
  let DBdata = {};

  console.log(
    "Number of documents inserted in this timeframe: ",
    timeframeDocs,
    "\nNumber of all documents in the collections: ",
    allDocs
  );
  DBdata.timeframeNumberOfMessages = timeframeDocs;
  DBdata.timeframeMessageInsertRate = timeframeDocs / timeframe;
  DBdata.totalNumberOfMessages = allDocs;
  return DBdata;

  // ]).then(([timeframeDocs, allDocs]) => {
  //   let DBdata = {};
  //   console.log(
  //     "Number of documents inserted in this timeframe: ",
  //     timeframeDocs,
  //     "\nNumber of all documents in the collections: ",
  //     allDocs
  //   );
  //   DBdata.timeframeNumberOfMessages = timeframeDocs;
  //   DBdata.timeframeMessageInsertRate = timeframeDocs / timeframe;
  //   DBdata.totalNumberOfMessages = allDocs;
  //   return DBdata;
  // });
};
