const overviewController = require("../controllers/overview.controller");

module.exports = function (app) {
  app.get(
    "/consumer/generateOverviewData",
    overviewController.generateOverviewData
  );

  // app.post("/consumer/createProcess", overviewController.createProcess);

  // app.post("/consumer/deleteProcess");
};
