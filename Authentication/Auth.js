const passport = require('passport')
const localStrategy = require('passport-local').Strategy;
const mongodb = require('mongodb')
const dbHandler = require('../DBHandler/DBHandler')
const bcrypt = require("bcrypt")

const setup = () => {
  //Passport Authentication Verification
  passport.use(new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
  }, (username, password, done) => {
    dbHandler.db.Users.find({ username }).toArray((err, user) => {
      if (err) return done(err)
      if (user.length !== 1) {
        return done(null, false, [{ msg: 'Incorrect username.' }]);
      }
      bcrypt.compare(password, user[0].password, (error, res) => {
        if (error) return done(null, false, { msg: 'Incorrect password.' });
        if (res) return done(null, user[0]);
        return done(null, false, { msg: 'Incorrect password.' });
      })
    });
  }));
  // Passport Serialize User
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    dbHandler.db.Users.find({ _id: new mongodb.ObjectID(id) }).toArray((err, user) => {
      done(err, user[0]);
    });
  });
}
module.exports = setup;