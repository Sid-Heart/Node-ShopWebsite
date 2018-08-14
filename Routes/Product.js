const express = require('express')
const route = express.Router()

route.get("/", (req, res) => {
  req.log("Product Home Page Rendered")
  res.send("OK")
})

module.exports = route;