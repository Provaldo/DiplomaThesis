const overviewController = require("../controllers/overview.controller");

module.exports = function (app) {
  app.post(
    "/consumer/generateOverviewData",
    overviewController.generateOverviewData
  );

  // app.post("/consumer/createProcess", overviewController.createProcess);

  // app.post("/consumer/deleteProcess");
};
