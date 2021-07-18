const db = require("../models");
const User = db.user;

checkDuplicateConsumer = (req, res, next) => {
  // Username
  User.findOne({
    username: req.user.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    const searchResult = user.consumers.find(
      (consumer) => consumer.name === req.body.rmqConsumerName
    );

    if (searchResult) {
      return res.status(400).json({
        rmqConsumerName: "Consumer name already exists",
      });
    } else {
      next();
    }
  });
};

const verifyConsumer = {
  checkDuplicateConsumer,
};

module.exports = verifyConsumer;
