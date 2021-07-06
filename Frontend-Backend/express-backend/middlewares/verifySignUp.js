const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({
    username: req.body.username,
  }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (user) {
      // res.status(400).send({ message: "Failed! Username is already in use!" });
      // return;
      return res.status(400).json({
        username: "Username already exists",
      });
    }

    // Email
    User.findOne({
      email: req.body.email,
    }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (user) {
        // res.status(400).send({ message: "Failed! Email is already in use!" });
        // return;
        return res.status(400).json({ email: "Email already exists" });
      }

      next();
    });
  });
};

checkRolesExisted = (req, res, next) => {
  if (req.body.roles) {
    for (let i = 0; i < req.body.roles.length; i++) {
      if (!ROLES.includes(req.body.roles[i])) {
        res.status(400).send({
          message: `Failed! Role ${req.body.roles[i]} does not exist!`,
        });
        return;
      }
    }
  }

  next();
};

// I removed this function below, adjusted a bit the validation/register.js file and used that one directly instead.
// So this function is now kinda useless.
// addition from https://www.designmycodes.com/react/reactjs-redux-nodejs-mongodb-jwt-authentication-tutorial.html
const validateRegisterInput = require("../validation/register");

inputValidationSignup = (req, res, next) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  next();
};

// =======================================================

const verifySignUp = {
  checkDuplicateUsernameOrEmail,
  checkRolesExisted,
  inputValidationSignup,
};

module.exports = verifySignUp;
