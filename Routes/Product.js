const express = require('express')
const mongodb = require('mongodb')
const { check } = require('express-validator/check');
const dbHandler = require('../DBHandler/DBHandler')
const route = express.Router()

route.get("/", (req, res) => {
  req.log("Product Home Page Rendered")
  res.send("OK")
})

route.get("/add", (req, res) => {
  req.log("GET /product/add")
  if (req.user === undefined) {
    req.log("Not Authorized ", req.user)
    req.flash("error", [{ msg: "Not Authorized To Add Product" }])
    return res.redirect("/")
  }
  if (req.user.role !== 'seller') {
    req.log("Not Authorized ", req.user)
    req.flash("error", [{ msg: "Not Authorized To Add Product" }])
    return res.redirect("/")
  }

  return res.render("product/add")
})

route.post("/add", [
  check('name').not().isEmpty().withMessage("Name Should Not Be Null"),
  check('description').not().isEmpty().withMessage("Description Should Not Be Null"),
  check('stock').not().isEmpty().withMessage("Stock Should Not Be Null").isNumeric().withMessage("Stock Should Be Numeric"),
  check('expiry').not().isEmpty().withMessage("expiry Should Not Be Null"),
  check('category').not().isEmpty().withMessage("Category Should Not Be Null"),
  check('price').not().isEmpty().withMessage("Price Should Not Be Null").isFloat().withMessage("Price is not Float")
], (req, res) => {
  req.log("POST /product/add ", req.body)
  if (req.user === undefined) {
    req.log("Not Authorized ", req.user)
    req.flash("error", [{ msg: "Not Authorized To Add Product" }])
    return res.redirect("/")
  }
  const errors = req.validationResult(req);
  if (!errors.isEmpty()) {
    req.log('Product Add Failed With Error', errors.array())
    return res.render("product/add", { error: errors.array() })
  }
  req.body.seller = req.user._id
  req.body.stock = parseInt(req.body.stock,10)
  req.body.price = parseInt(req.body.price,10)
  dbHandler.db.Products.insertOne(req.body, (error, result) => {
    if (error) {
      req.log("DB Error While Adding Product with Error", error)
      req.flash("error", "DB Error, Unable To Add Product")
      return res.redirect("/")
    }
    req.log("Product Added To Database with result", result)
    req.flash("success", "Product Added Successfully!")
    return res.redirect("/product/view")
  })
  return null
})

route.get("/view/:id", (req, res) => {
  req.log("GET /product/view/:id with id ", req.params.id)
  try {
    dbHandler.db.Products.find({ "_id": new mongodb.ObjectId(req.params.id) }).toArray((error, result) => {
      if (error || result.length !== 1) {
        req.log("Failed To View Product With Error", error)
        req.flash("error","Product Not Found")
        return res.redirect("/")
      }
      dbHandler.db.Users.find({ "_id": new mongodb.ObjectId(result[0].seller) }).toArray((reeor1, result1) => {
        if (error) {
          req.log("Failed To View Product Seller With Error", error)
          req.flash("error","Product Not Found")
          return res.redirect("/")
        }
        if (result1.length === 1) result[0].seller = result1[0].name
        req.log("Single Product Found ", result)
        return res.render("product/single_product", { result })
      })
      return null
    })
  } catch (err) {
    req.flash("error","Product Not Found")
    return res.redirect("/")
  }
  return null
})

route.get("/view", (req, res) => {
  req.log("GET /product/view with query ", req.query)
  dbHandler.db.Products.find({ "name": { $regex: req.query.q ? req.query.q : "", $options: 'i' } }).toArray((error, result) => {
    if (error) {
      req.log("Failed To View Product With Error", error)
      return res.render("product/view")
    }
    req.log("Product Found ", result)
    return res.render("product/view", { result })
  })
})

route.get("/mine", (req, res) => {
  req.log("GET /product/mine with id ", req.user)
  if (req.user === undefined) {
    req.log("Failed To Product User Undefined")
    req.flash('error', "Please Login Into Seller Account")
    return res.redirect("/")
  }
  dbHandler.db.Products.find({ "seller": new mongodb.ObjectId(req.user._id) }).toArray((error, result) => {
    if (error) {
      req.log("Failed To View Product With Error", error)
      return res.render("product/view")
    }
    req.log("Product Found ", result)
    return res.render("product/view", { result })
  })
  return null
})

module.exports = route;