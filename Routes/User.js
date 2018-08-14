const express = require('express')
const { check } = require('express-validator/check');
const dbHandler = require('../DBHandler/DBHandler')
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
  dbHandler.db.Users.insert({name:req.body.name,
    email:req.body.email,
    username:req.body.username,
    password:req.body.password,
    role:req.body.role},(error,result) => {
    if (error) {
      req.log("DB Error While Inserting To Users")
      req.flash("DB Error, Unable To Register")
      return res.redirect("/")
    }
    req.log("DB Inserting To Users Success With Response ",result)
    req.log("Register Successful Redirecting To Login Page")
    req.flash("success", "Registration Successful")
    return res.redirect("/user/login")
  })
  return null;
})

route.get("/username",[check('q').isLength({min:5}).withMessage("Username Invalid")],(req,res) => {
  req.log("GET : /user/username "+JSON.stringify(req.query))
  const errors = req.validationResult(req)
  if (!errors.isEmpty()) return res.send("Invalid Request")
  dbHandler.db.Users.find({username:req.query.q}).toArray((error,result) => {
    if (error) return res.setHeader(503).send("Unable To Process Req")
    req.log("Requested fullfilled for "+req.query.q+" With Response ",result)
    if (result.length>0) return res.json({exists:true})
    return res.json({exists:false})
  })
  return null;
})

route.get("/register", (req, res) => {
  req.log("GET : /user/register ")
  res.render('user/register')
})

route.get("/login", (req, res) => {
  res.render("user/login")
})

module.exports = route;