const mongodb = require('mongodb')
const Logger = require('../Logger/Logger')
const exportObj = {
  startServer: () => {
    mongodb.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
      if (err) throw err
      const database = client.db("shopDB");
      const tempdb = {
        Users: database.collection("Users"),
        Products: database.collection("Products"),
        Orders: database.collection("Orders")
      }
      Logger.log("Connected To DB mongodb://localhost:27017")
      // Creating Database reference MiddleWare
      exportObj.db = tempdb;
    })
  }
}
module.exports = exportObj