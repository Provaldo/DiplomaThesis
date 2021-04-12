const { authSession, verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const sessions = require("client-sessions");
const config = require("../config/auth.config.js");

const verifySignIn = require("../middlewares/verifySignIn");

module.exports = function (app) {
  //   app.use(function (req, res, next) {
  //     res.header(
  //       "Access-Control-Allow-Headers",
  //       "x-access-token, Origin, Content-Type, Accept"
  //     );
  //     next();
  //   });
  app.use(
    sessions({
      cookieName: "session",
      secret: config.secret,
      duration: 30 * 60 * 1000, // 30 minutes
      activeDuration: 5 * 60 * 1000,
      httpOnly: true, // don't let JS code access cookies
      secure: true, // only set cookies over https
      ephemeral: true, // destroy cookies when the browser closes
    })
  );

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.inputValidationSignup,
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    controller.signup
  );

  app.post(
    "/api/auth/signin",
    [verifySignIn.inputValidationSignin],
    controller.signin
  );

  app.get("/api/auth/signout", controller.signout);

  app.get(
    "/api/auth/sessionCheck",
    [authSession.verifySession],
    controller.sessionCheck
  );
};
