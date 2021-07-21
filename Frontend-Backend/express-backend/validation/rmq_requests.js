const Validator = require("validator");
const isEmpty = require("./is-empty");

// exports.validateRMQServerRequestInput = (req, res, next) => {
//   const data = req.body;
//   let errors = {};
//   data.rmq_username = !isEmpty(data.rmq_username) ? data.rmq_username : "";
//   data.rmq_password = !isEmpty(data.rmq_password) ? data.rmq_password : "";

//   if (
//     Validator.equals(data.rmq_username, "admin") ||
//     Validator.equals(data.rmq_username, "guest") ||
//     Validator.equals(data.rmq_username, "test")
//   ) {
//     errors.rmq_username = `Username can't be any of "admin", "guest" or "test".`;
//   }

//   if (!Validator.isAlphanumeric(data.rmq_username)) {
//     errors.rmq_username = "Username must contain only alphanumeric characters";
//   }

//   if (!Validator.isLength(data.rmq_username, { min: 2, max: 10 })) {
//     errors.rmq_username = "Username must be between 2 to 10 chars";
//   }

//   if (Validator.isEmpty(data.rmq_username)) {
//     errors.rmq_username = "Username is required";
//   }

//   if (!Validator.isLength(data.rmq_password, { min: 6, max: 20 })) {
//     errors.rmq_password = "Password must be between 6 and 20 characters";
//   }

//   if (Validator.isEmpty(data.rmq_password)) {
//     errors.rmq_password = "Password is required";
//   }

//   if (isEmpty(errors)) {
//     next();
//   } else {
//     return res.status(400).json(errors);
//   }
// };

exports.validateRMQConsumerRequestInput = (req, res, next) => {
  const data = req.body;
  let errors = {};
  data.rmqConsumerName = !isEmpty(data.rmqConsumerName)
    ? data.rmqConsumerName
    : "";
  data.rmqExchangeName = !isEmpty(data.rmqExchangeName)
    ? data.rmqExchangeName
    : "";
  data.rmqRoutingKey = !isEmpty(data.rmqRoutingKey) ? data.rmqRoutingKey : "";
  data.rmqLoggingConditions = !isEmpty(data.rmqLoggingConditions)
    ? data.rmqLoggingConditions
    : "";

  if (!Validator.isAlphanumeric(data.rmqConsumerName)) {
    errors.rmqConsumerName =
      "Consumer Name must contain only alphanumeric characters";
  }

  if (!Validator.isLowercase(data.rmqConsumerName)) {
    errors.rmqConsumerName =
      "Consumer Name must contain only lowercase characters (don't hate me hate rabbitmq. jk blame me)";
  }

  if (!Validator.isLength(data.rmqConsumerName, { min: 2, max: 10 })) {
    errors.rmqConsumerName = "Consumer Name must be between 2 to 10 chars";
  }

  if (Validator.isEmpty(data.rmqConsumerName)) {
    errors.rmqConsumerName = "Consumer Name is required";
  }

  if (Validator.isEmpty(data.rmqExchangeName)) {
    errors.rmqExchangeName = "Exchange Name is required";
  }

  if (Validator.isEmpty(data.rmqRoutingKey)) {
    errors.rmqRoutingKey = "Routing Key is required";
  }

  if (Validator.isEmpty(data.rmqLoggingConditions)) {
    // !Array.isArray(data.rmqLoggingConditions) ||
    // !data.rmqLoggingConditions.length {
    errors.rmqLoggingConditions = "Logging Conditions are required";
  }

  if (isEmpty(errors)) {
    next();
  } else {
    return res.status(400).json(errors);
  }
};
