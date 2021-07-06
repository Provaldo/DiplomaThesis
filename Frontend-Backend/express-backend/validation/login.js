const Validator = require("validator");
const isEmpty = require("./is-empty");

// module.exports = function validateLoginInput(data) { // this was used when this function was called from the middlewares/verifySignIn.js file
module.exports = function validateLoginInput(req, res, next) {
  const data = req.body;
  let errors = {};
  data.username = !isEmpty(data.username) ? data.username : "";
  data.password = !isEmpty(data.password) ? data.password : "";

  if (Validator.isEmpty(data.username)) {
    errors.username = "Username field is required";
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = "Password is required";
  }

  // this was used when this function was called from the middlewares/verifySignIn.js file
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
