const MongoClient = require("mongodb").MongoClient;
const test = require("assert");

const dbConfig = require("../config/db.config");

exports.test = (req, res) => {
  // Connection url
  const url = `mongodb://${dbConfig.DB_USERNAME}:${dbConfig.DB_PASSWORD}@${dbConfig.DB_SERVER}:${dbConfig.DB_PORT}`;

  // Database Name
  // const dbName = `${dbConfig.DB_DBNAME}`;

  MongoClient.connect(
    url,
    {
      useUnifiedTopology: true,
    },
    function (err, client) {
      if (err) {
        res.status(500).send({ message: err });
        console.log("Connection error", err);
        // ProcessingInstruction.exit(); // I don't know what this does
        return;
      }

      console.log("successfully connected to MongoDB from testFunction");

      client
        .db("mple")
        .addUser(
          "mple",
          "password",
          { roles: [{ role: "readWrite", db: "mple" }] },
          function (err, result) {
            if (err) {
              res.status(500).send({ message: err });
              console.log('User "mple" creation error: ', err);
              // ProcessingInstruction.exit(); // I don't know what this does
            }

            console.log('Successfully created user "mple": ', result);
            res.status(200).send({ message: "ok" });

            client.close();
          }
        );

      // // Use the admin database for the operation

      // const adminDb = client.db(dbName).admin();

      // // List all the available databases

      // adminDb.listDatabases(function (err, dbs) {
      //   if (err) {
      //     res.status(500).send({ message: err });
      //     console.log("List Databases error", err);
      //     // ProcessingInstruction.exit(); // I don't know what this does
      //     return;
      //   }

      //   test.strictEqual(null, err);

      //   test.ok(dbs.databases.length > 0);

      //   console.log("Databases are: ", dbs);

      //   // client.close();
      // });

      // Create a user on db admin with read access to test2 db

      // adminDb.addUser(
      //   "user2",
      //   "password",
      //   { roles: [{ role: "read", db: "test2" }] },
      //   function (err, result) {
      //     if (err) {
      //       res.status(500).send({ message: err });
      //       console.log("User2 creation error: ", err);
      //       // ProcessingInstruction.exit(); // I don't know what this does
      //     }

      //     console.log("Successfully created user2: ", result);
      //     res.status(200).send({ message: "ok" });
      //     client.close();
      //   }
      // );
    }
  );
};
