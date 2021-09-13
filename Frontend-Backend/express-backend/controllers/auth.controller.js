const db = require("../models");
const User = db.user;
const Role = db.role;

const bcrypt = require("bcryptjs");

exports.signup = (req, res, next) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 14),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            // res.send({ message: "User was registered successfully!" });
            next();
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        user.roles = [role._id];
        user.save((err) => {
          if (err) {
            res.status(500).send({ message: err });
            return;
          }

          // res.send({ message: "User was registered successfully!" });
          next();
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  let errors = {};

  User.findOne({
    username: req.body.username,
    // email: req.body.email,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        console.log("I'm here. err: ", err, "\nuser: ", user);
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        // return res.status(404).send({ message: "User Not found." });
        errors.username = "User not found";
        return res.status(404).json(errors);
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        // return res.status(401).send({
        //   //   accessToken: null,
        //   message: "Invalid Password!",
        // });
        errors.password = "Incorrect Password";
        return res.status(400).json(errors);
      }

      //   var token = jwt.sign({ id: user.id }, config.secret, {
      //     expiresIn: 86400, // 24 hours
      //   });

      req.session.userId = user._id; // this sets the session cookie

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }
      res.status(200).send({
        id: user._id,
        username: user.username,
        email: user.email,
        roles: authorities,
        rabbitmqServer: user.rabbitmqServer,
        consumers: user.consumers,
        // accessToken: token,
      });
    });
};

exports.signout = (req, res) => {
  // found that from https://blog.logrocket.com/securing-a-react-app/
  res.clearCookie("session").end();

  // Or another implementation from https://itnext.io/mastering-session-authentication-aa29096f6e22
  // try {
  //   const session = req.session;
  //   const user = session.userId;
  //   if (user) {
  //     session.destroy(err => {
  //       if (err) throw (err);

  //       res.clearCookie("session");
  //       res.send(user);
  //     });
  //   } else {
  //     throw new Error('Something went wrong');
  //   }
  // } catch (err) {
  //  // res.status(422).send(parseError(err));
  //  res.status(422).send(JSON.stringify(err, Object.getOwnPropertyNames(err)));
  // }
};

exports.sessionCheck = (req, res) => {
  const user = req.user;
  res.send({ user });
};
