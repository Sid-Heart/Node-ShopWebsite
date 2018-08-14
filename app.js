const express = require('express')
const Logger = require('./Logger/Logger')
const bodyParser = require("body-parser")
const flash = require('connect-flash');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dbHandler = require('./DBHandler/DBHandler')
const app = express()
const { check, validationResult } = require('express-validator/check');

//Setup For PUG Template Engine
app.set('views', './views')
app.set('view engine', 'pug')

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Passing Logger Middleware
app.use("*", (req, res, next) => {
  req.log = Logger.log
  req.check = check;
  req.validationResult = validationResult;
  next()
})

//Cookie Middleware
app.use(cookieParser('keyboard cat'));

//Session Middleware
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    cookie: {maxAge: 60000}
  }
}))

// Express Messages Middleware
app.use(flash());

// Middleware To Flash Messages
app.use((req, res, next) => {
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")
  res.locals.warnings = req.flash("warnings")
  next();
});

// Configuring Routes
app.use("/product", require("./Routes/Product"))
app.use("/user", require("./Routes/User"))
app.use("/order", require("./Routes/Order"))

dbHandler.startServer();

//Start Server
app.listen(3000, () => {
  Logger.log("Server Started at http://localhost:3000")
})

//Home Page
app.get("/", (req, res) => {
  Logger.log("GET: /")
  res.render("index")
})