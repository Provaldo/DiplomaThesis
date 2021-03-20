const sessions = require("client-sessions");
const config = require("../config/auth.config.js");
const db = require("../models");
const User = db.user;
const Role = db.role;

const session = sessions({
  cookieName: "session",
  secret: config.secret,
  duration: 30 * 60 * 1000, // 30 minutes
  activeDuration: 5 * 60 * 1000,
  httpOnly: true, // don't let JS code access cookies
  secure: true, // only set cookies over https
  ephemeral: true, // destroy cookies when the browser closes
});

verifySession = (req, res, next) => {
  if (!(req.session && req.session.userId)) {
    return res.status(403).send({ message: "No valid session exists!" });
    // return next();
  }

  User.findById(req.session.userId, (err, user) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized!" });
      // return next(err);
    }

    if (!user) {
      return res.status(401).send({ message: "Unauthorized!" });
      // return next();
    }

    user.password = undefined;

    req.user = user;
    res.locals.user = user; // this makes the user info accessible to the html templates

    next();
  });
  //   let token = req.headers["x-access-token"];

  //   if (!token) {
  //     return res.status(403).send({ message: "No token provided!" });
  //   }

  //   jwt.verify(token, config.secret, (err, decoded) => {
  //     if (err) {
  //       return res.status(401).send({ message: "Unauthorized!" });
  //     }
  //     req.userId = decoded.id;
  //     next();
  //   });
};

isAdmin = (req, res, next) => {
  User.findById(req.session.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "admin") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Admin Role!" });
        return;
      }
    );
  });
};

isModerator = (req, res, next) => {
  User.findById(req.session.userId).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    Role.find(
      {
        _id: { $in: user.roles },
      },
      (err, roles) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        for (let i = 0; i < roles.length; i++) {
          if (roles[i].name === "moderator") {
            next();
            return;
          }
        }

        res.status(403).send({ message: "Require Moderator Role!" });
        return;
      }
    );
  });
};

const authSession = {
  verifySession,
  isAdmin,
  isModerator,
  session,
};
module.exports = authSession;
