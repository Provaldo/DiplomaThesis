const express = require("express");
let app = express();
const consumerController = require("./controllers/consumer.controller");

// NA TA TSEKARW TA PARAKATW AN EINAI APARAITITA EDW
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
var corsOptions = {
  origin: "http://localhost:5000",
};
app.use(cors(corsOptions));

// routes
require("./routes/consumer.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});

consumerController.consumerProcess();
