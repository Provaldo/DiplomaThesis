const { authSession, verifySignUp } = require("../middlewares");
const authController = require("../controllers/auth.controller");
const dbController = require("../controllers/db.controller");
// const k8sController = require("../controllers/k8s.controller");
const {
  rmqServerDeployment,
  rmqIntService,
  rmqExtService,
} = require("../controllers/rabbitmq");
const sessions = require("client-sessions");
const config = require("../config/auth.config.js");
const validateLoginInput = require("../validation/login");
const validateRegisterInput = require("../validation/register");

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
      validateRegisterInput,
      verifySignUp.checkDuplicateUsernameOrEmail,
      verifySignUp.checkRolesExisted,
    ],
    authController.signup,
    rmqServerDeployment.deploymentCreator,
    rmqIntService.internalServiceCreator,
    rmqExtService.externalServiceCreator,
    dbController.signup,
    dbController.registerRMQServer
  );

  app.post("/api/auth/signin", [validateLoginInput], authController.signin);

  app.get("/api/auth/signout", authController.signout);

  app.get(
    "/api/auth/sessionCheck",
    [authSession.verifySession],
    authController.sessionCheck
  );
};
