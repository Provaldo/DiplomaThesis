const { authSession } = require("../middlewares");

module.exports = function (app) {
  app.get("/api/testFunction", [authSession.verifySession]);
};
