//environmental variables
require("dotenv").config();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");

//Article Model
let Article = require("../models/article");
//User model
let User = require("../models/user");

//Logged user profile
router.get("/profile/:id", ensureAuthenticated, function (req, res) {
  User.findById(req.user._id, function (err, user) {
    Article.find({ author: user.username }, (err, articles) => {
      if (err) {
        console.log(err);
      } else {
        res.render("user_profile", {
          user: user,
          articles: user.bookmarks,
          user_articles: articles,
        });
      }
    });
  });
});

//Author of book profile
router.get("/author_profile/:author", ensureAuthenticated, function (req, res) {
  User.findOne({ username: req.params.author }, function (err, user) {
    Article.find({ author: user.username }, (err, articles) => {
      if (err) {
        console.log(err);
      } else {
        res.render("user_profile", {
          user: user,
          articles: user.bookmarks,
          user_articles: articles,
        });
      }
    });
  });
});

//Register form
router.get("/register", function (req, res) {
  res.render("register");
});

//Register process
router.post("/register", function (req, res) {
  const name = req.body.name;
  const surname = req.body.surname;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;

  req.checkBody("name", "Name is required").notEmpty();
  req.checkBody("surname", "Surname is required").notEmpty();
  req.checkBody("email", "Email is required").notEmpty();
  req.checkBody("email", "Not valid email").isEmail();
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();
  req.checkBody("password2", "Confirm password is required").notEmpty();
  req
    .checkBody("password2", "Passwords do not match")
    .equals(req.body.password);

  const hashedPassword = bcrypt.hashSync(password, 8); //encrypt pass

  let errors = req.validationErrors();
  if (errors) {
    res.render("register", {
      errors: errors,
    });
  } else {
    User.findOne({ username: req.body.username }, function (err, user) {
      //Check if email already exists in db
      if (err) {
        console.log(err);
      } else if (user) {
        req.flash("danger", "User exists !");
        res.redirect("/users/register");
      } else {
        User.create(
          {
            name,
            surname,
            email,
            username,
            password: hashedPassword,
          },
          function (err, user) {
            if (err)
              return res
                .status(500)
                .send("There was a problem registering the user.");

            req.flash("success", "Verify Email");
            res.redirect("/users/login");
          }
        );
      }
    });
  }
});

//Render login page
router.get("/login", function (req, res) {
  res.render("login");
});

//Login process
router.post("/login", function (req, res, next) {
  req.checkBody("username", "Username is required").notEmpty();
  req.checkBody("password", "Password is required").notEmpty();

  let errors = req.validationErrors();
  if (errors) {
    res.render("login", {
      errors: errors,
    });
  } else {
    passport.authenticate("local", {
      failureRedirect: "/users/login",
      successRedirect: "/",
    })(req, res, next);
  }
});

//Logout
router.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out");
    res.redirect("/");
  });
});

//Access control
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please login");
    res.render("login");
  }
}

module.exports = router;
