const express = require('express')
const mongodb = require('mongodb')
const route = express.Router()

route.get("/", (req, res) => {
  req.log("Order Home Page Rendered")
  res.send("OK")
})

module.exports = route;