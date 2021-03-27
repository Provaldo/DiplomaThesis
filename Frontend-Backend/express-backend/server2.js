const PORT = process.env.PORT || 5000;

const express = require("express");
let app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// #####################################################################################
// ########################### DATABASE HANDLING #########################
// #####################################################################################

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test2", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rabbitmqServers: [{ name: String, createdAt: Date, id: String }], //not sure about this one
    consumers: [{ name: String, createdAt: Date, id: String, topic: String }],
    consumersNr: Number, // or this
  })
);

// #####################################################################################
// #####################################################################################

const sessions = require("client-sessions");

app.use(
  sessions({
    cookieName: "session",
    secret: "mySuperSecretSecret",
    duration: 30 * 60 * 1000, // 30 minutes
    activeDuration: 5 * 60 * 1000,
    httpOnly: true, // don't let JS code access cookies
    secure: true, // only set cookies over https
    ephemeral: true, // destroy cookies when the browser closes
  })
);

function loginRequired(req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }

  next();
}

const bcrypt = require("bcryptjs");

app.set("view engine", "pug");

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // hashing the password
  let hash = bcrypt.hashSync(req.body.password, 14);
  req.body.password = hash;

  let user = new User(req.body);

  user.save((err) => {
    if (err) {
      let error = "Something bad happened! Please try again.";

      if (err.code === 11000) {
        error = "That username is already taken, please try another.";
      }

      return res.render("register", { error: error });
    }

    res.redirect("/App");
  });
  // res.json(req.body);
});

app.get("/clear-cookie", (req, res) => {
  // found that from https://blog.logrocket.com/securing-a-react-app/
  res.clearCookie("session").end();
});

app.get("/App", (req, res, next) => {
  res.render("../react-frontend/src/App");
});

app.post("/testLogin", (req, res, next) => {
  console.log(
    "I'm here. Username: ",
    req.body,
    "\nPassword: ",
    req.body.password
  );
  User.findOne({ username: req.body.username }, (err, user) => {
    // if (err || !user || req.body.password !== user.password) {  // this was before implementing password hashing
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      console.log("Oh no...");
      return res.send({ loggedIn: false, msg: "Incorrect username/password." });
    }

    req.session.userId = user._id; // this sets the session cookie
    // res.send({ loggedIn: true, msg: "You are logged in" });
    res.render("dashboard");
    console.log(res.render("dashboard"));
  });
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
