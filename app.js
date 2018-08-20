const express = require('express')
const Logger = require('./Logger/Logger')
const bodyParser = require("body-parser")
const flash = require('connect-flash');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const dbHandler = require('./DBHandler/DBHandler')
const { validationResult } = require('express-validator/check');
const authSetup = require("./Authentication/Auth")
const passport = require('passport')
const app = express()

// Setup Auth and Serializer
authSetup();

//Setup For PUG Template Engine
app.set('views', './views')
app.set('view engine', 'pug')

// BodyParser Middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Passing Logger Middleware
app.use("*", (req, res, next) => {
  req.log = Logger.log
  req.validationResult = validationResult;
  req.log("Attached Logging Middleware")
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
    cookie: { maxAge: 60000 }
  }
}))

//Passport Middleware
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

// Express Messages Middleware
app.use(flash());

// Middleware To Flash Messages
app.use((req, res, next) => {
  res.locals.errors = req.flash("error")
  res.locals.success = req.flash("success")
  res.locals.warnings = req.flash("warnings")
  if (req.user !== undefined) res.locals.user = {role:req.user.role}
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