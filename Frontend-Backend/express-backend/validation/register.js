const Validator = require("validator");
const isEmpty = require("./is-empty");

// this was used when this function was called from the middlewares/verifySignUp.js file
// module.exports = function validateRegisterInput(data) {
module.exports = function validateRegisterInput(req, res, next) {
  const data = req.body;
  let errors = {};
  data.username = !isEmpty(data.username) ? data.username : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.password_confirm = !isEmpty(data.password_confirm)
    ? data.password_confirm
    : "";

  if (
    Validator.equals(data.username, "admin") ||
    Validator.equals(data.username, "config") ||
    Validator.equals(data.username, "local") ||
    Validator.equals(data.username, "auth") ||
    Validator.equals(data.username, "test")
  ) {
    errors.username = `Username can't be any of "admin", "config", "local", "auth" or "test". You sneaky son of a mother.`;
  }

  if (!Validator.isAlphanumeric(data.username)) {
    errors.username = "Username must contain only alphanumeric characters";
  }

  if (!Validator.isLength(data.username, { min: 2, max: 30 })) {
    errors.username = "Username must be between 2 to 30 chars";
  }

  if (Validator.isEmpty(data.username)) {
    errors.username = "Username is required";
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = "Email is required";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = "Password must be between 6 and 30 characters";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  if (!Validator.isLength(data.password_confirm, { min: 6, max: 30 })) {
    errors.password_confirm = "Password must be between 6 and 30 characters";
  }

  if (!Validator.equals(data.password, data.password_confirm)) {
    errors.password_confirm = "Password and Confirm Password must match";
  }

  if (Validator.isEmpty(data.password_confirm)) {
    errors.password_confirm = "Password is required";
  }

  // this was used when this function was called from the middlewares/verifySignUp.js file
  // return {
  //   errors,
  //   isValid: isEmpty(errors),
  // };

  if (isEmpty(errors)) {
    next();
  } else {
    return res.status(400).json(errors);
  }
};
