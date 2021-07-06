const express = require("express");
let app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const cors = require("cors");
var corsOptions = {
  origin: "http://localhost:5000",
};
app.use(cors(corsOptions));

// #####################################################################################
// ########################### DATABASE HANDLING #########################
// #####################################################################################

const dbConfig = require("./config/db.config");
const db = require("./models");
const Role = db.role;

db.mongoose
  .connect(
    // `mongodb://${dbConfig.DB_USERNAME}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_SERVER}:${dbConfig.PORT}/${dbConfig.DB}`,
    `mongodb://${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}/${dbConfig.DB_DBNAME}`, // Afto leitourgei stin ylopoihsh tis DB eite ws Deployment, eite ws StatefulSet. Apla prepei na allazei to mongo-configmap.yaml
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      auth: { authSource: "admin" },
      user: dbConfig.DB_USERNAME,
      pass: dbConfig.DB_PASSWORD,
      // useMongoClient: true, // WARNING: The `useMongoClient` option is no longer necessary in mongoose 5.x, please remove it.
    }
  )
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

// #####################################################################################
// #####################################################################################

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to designmycodes application." });
});

// routes
require("./routes/auth.routes")(app);
require("./routes/user.routes")(app);
require("./routes/rabbitmq.routes")(app);
require("./routes/test.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
