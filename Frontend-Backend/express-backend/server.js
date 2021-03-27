// The express server should be serving the build folder, which will be created during the deployment to a remote server.
// The following snippet is a basic Express server. We will be adding authentication and other things on top of it.

// const express = require('express');
// const path = require('path');
// const app = express();

const PORT = process.env.PORT || 5000;

// app
//   .use(express.static(path.join(__dirname, '/client/build')))
//   .listen(PORT, () => console.log(`Listening on ${PORT}`));

// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build/index.html'));
// });

// ======== Randall Degges code ===========

const express = require("express");
let app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let User = mongoose.model(
  "User",
  new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  })
);

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

// SmartUser middleware to make user info accessible in the request body everywhere if it exists.
// this combined with the forced authentication middleware next "loginRequired" makes the
// code smaller and more beautiful
app.use((req, res, next) => {
  if (!(req.session && req.session.userId)) {
    return next();
  }

  User.findById(req.session.userId, (err, user) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return next();
    }

    user.password = undefined;

    req.user = user;
    res.locals.user = user; // this makes the user info accessible to the html templates

    next();
  });
});

// force authentication middleware
function loginRequired(req, res, next) {
  if (!req.user) {
    return res.redirect("/login");
  }

  next();
}

const bcrypt = require("bcryptjs");

const csurf = require("csurf");

app.use(csurf());

const helmet = require("helmet");

// manage http header security
app.use(helmet());

app.set("view engine", "pug");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  // res.render("register"); // this was before implementing the csurf library
  res.render("register", { csrfToken: req.csrfToken() });
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
        error = "That email is already taken, please try another.";
      }

      return res.render("register", { error: error });
    }

    res.redirect("/dashboard");
  });
  // res.json(req.body);
});

app.get("/login", (req, res) => {
  // res.render("login"); // this was before implementing the csurf library
  res.render("login", { csrfToken: req.csrfToken() });
});

app.post("/login", (req, res) => {
  console.log("request: ", req);
  User.findOne({ username: req.body.username }, (err, user) => {
    // if (err || !user || req.body.password !== user.password) {  // this was before implementing password hashing
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res.render("login", {
        error: "Incorrect username/password.",
      });
    }

    req.session.userId = user._id; // this sets the session cookie
    res.redirect("/dashboard");
  });
});

// the following was before implementing the SmartUser middleware and the loginRequired middleware
// so these functions had to be implemented within the dashboard get method
// app.get("/dashboard", (req, res) => {
//   if (!(req.session && req.session.userId)) {
//     return res.redirect("/login");
//   }

//   User.findById(req.session.userId, (err, user) => {
//     if (err) {
//       return next(err);
//     }

//     if (!user) {
//       return res.redirect("/login");
//     }

//     res.render("dashboard");
//   });
//   // res.render("dashboard"); // that was before we implemented authenticated access only to the dashboard
// });

app.get("/dashboard", loginRequired, (req, res, next) => {
  res.render("dashboard");
});

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`);
});
