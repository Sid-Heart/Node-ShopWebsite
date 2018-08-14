const express = require('express')
const mongodb = require('mongodb')
const { check } = require('express-validator/check');
const route = express.Router()

route.get("/", (req, res) => {
  req.log("GET : /user/")
})

route.post("/register", [
  check('name').not().isEmpty().withMessage("Name Cannot Be Empty"),
  check('username').isLength({ min: 5 }).withMessage("Username Must Be Of Minimum Length 5"),
  check('email').isEmail().withMessage("Email Is Not Valid"),
  check('password').isLength({ min: 8 }).withMessage("Password Isn't 8 Chars Long"),
  check('role').isIn(["seller", "courier", "buyer"]).withMessage("Unspecified Role")
], (req, res) => {
  req.log("POST : /user/register "+JSON.stringify(req.body))
  let errors = req.validationResult(req)
  errors = errors.array();
  if (req.body.password !== req.body.password2) errors.push({
    msg: "Password Doesnot Match"
  })
  if (errors.length>0) {
    req.log("Register Failed For"+JSON.stringify(errors))
    return res.render("user/register",{errors});
  }
  req.log("Register Successful Redirecting To Login Page")
  req.flash("success", "Registration Successful")
  return res.redirect("/user/login")
})

route.get("/register", (req, res) => {
  req.log("GET : /user/register User Registration Page Rendered")
  res.render('user/register')
})

route.get("/login", (req, res) => {
  res.render("user/login")
})

module.exports = route;