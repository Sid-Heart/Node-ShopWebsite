const express = require('express')
const { check } = require('express-validator/check');
const dbHandler = require('../DBHandler/DBHandler')
const passport = require('passport')
const bcrypt = require('bcrypt')
const route = express.Router()

route.get("/", (req) => {
  req.log("GET : /user/")
})

route.post("/register", [
  check('name').not().isEmpty().withMessage("Name Cannot Be Empty"),
  check('username').isLength({ min: 5 }).withMessage("Username Must Be Of Minimum Length 5"),
  check('email').isEmail().withMessage("Email Is Not Valid"),
  check('password').isLength({ min: 8 }).withMessage("Password Isn't 8 Chars Long"),
  check('role').isIn(["seller", "courier", "buyer"]).withMessage("Unspecified Role")
], (req, res) => {
  req.log("POST : /user/register " + JSON.stringify(req.body))
  let errors = req.validationResult(req)
  errors = errors.array();
  if (req.body.password !== req.body.password2) errors.push({
    msg: "Password Doesnot Match"
  })

  dbHandler.db.Users.find({ username: req.body.username }).toArray((error, result) => {
    if (error) return res.setHeader(503).send("Unable To Process Req")
    req.log("Looking For Username " + req.body.username + " With Response ", result)
    if (result.length > 0) errors.push({ msg: req.body.username + " is Taken" })
    if (errors.length > 0) {
      req.log("Register Failed For" + JSON.stringify(errors))
      return res.render("user/register", { errors });
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        req.log("Register Failed For" + JSON.stringify(errors))
        req.flash("Something Went Wrong")
        return res.render("/");
      }
      dbHandler.db.Users.insert({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: hash,
        role: req.body.role
      }, (errorInsert, insertResult) => {
        if (errorInsert) {
          req.log("DB Error While Inserting To Users")
          req.flash("error", "DB Error, Unable To Register")
          return res.redirect("/")
        }
        req.log("DB Inserting To Users Success With Response ", insertResult)
        req.log("Register Successful Redirecting To Login Page")
        req.flash("success", "Registration Successful")
        return res.redirect("/user/login")
      })
      return null
    })
    return null
  })
  return null
})

route.get("/username", [check('q').isLength({ min: 5 }).withMessage("Username Invalid")], (req, res) => {
  req.log("GET : /user/username " + JSON.stringify(req.query))
  const errors = req.validationResult(req)
  if (!errors.isEmpty()) return res.send("Invalid Request")
  dbHandler.db.Users.find({ username: req.query.q }).toArray((error, result) => {
    if (error) return res.setHeader(503).send("Unable To Process Req")
    req.log("Requested fullfilled for " + req.query.q + " With Response ", result)
    if (result.length > 0) return res.json({ exists: true })
    return res.json({ exists: false })
  })
  return null;
})

route.get("/register", (req, res) => {
  if (req.user !== undefined) {
    req.log("Not Authorized ", req.user)
    req.flash("error", "Logout First")
    return res.redirect("/")
  }
  req.log("GET : /user/register ")
  return res.render('user/register')
})

route.get("/login", (req, res) => {
  if (req.user !== undefined) {
    req.log("Not Authorized ", req.user)
    req.flash("error", "Logout First")
    return res.redirect("/")
  }
  req.log("GET : /user/login ")
  return res.render("user/login")
})

route.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/user/login',
  failureFlash: "Invalid Username Or Password",
  successFlash: "Login Successful"
}), (req, res) => {
  req.log("POST : /user/login ")
  res.flash("success", "Login Successful")
  res.redirect("/")
})

route.get('/logout', (req, res) => {
  req.logout();
  req.flash("success", "Logout Successful")
  res.redirect("/")
})
module.exports = route;