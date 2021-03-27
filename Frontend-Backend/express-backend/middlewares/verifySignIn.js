// addition from https://www.designmycodes.com/react/reactjs-redux-nodejs-mongodb-jwt-authentication-tutorial.html

const validateLoginInput = require("../validation/login");

inputValidationSignin = (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  next();
};

const verifySignIn = {
  inputValidationSignin,
};

module.exports = verifySignIn;

// =======================================================
