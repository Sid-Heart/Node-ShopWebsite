const express = require('express')
const mongodb = require('mongodb')
const route = express.Router()
const dbHandler = require('../DBHandler/DBHandler')

route.get("/", (req, res) => {
  req.log("Order Home Page Rendered")
  res.send("OK")
})

route.get("/view", (req, res) => {
  if (req.user === undefined) {
    req.log('GET order/view/ Failed With ' + req.user)
    req.flash("error", "Login A Courier Account")
    return res.redirect('/')
  } else if (req.user.buyer === 'courier') {
    req.log('GET order/view/ Failed With ' + req.user.role)
    req.flash("error", "Login A Courier Account")
    return res.redirect('/')
  }
  dbHandler.db.Orders.find({}).toArray((error, result) => {
    if (error) {
      req.log('GET order/view/ Failed With ' + error)
      req.flash("error", "Unable To Req DB Account")
      return res.redirect('/')
    }
    const callbackResults = []
    let callbackCount = result.length * 2
    result.map((value, index) => {
      dbHandler.db.Users.find({ _id: new mongodb.ObjectId(value.user) }).toArray((error1, result1) => {
        if (error1) callbackCount = -1
        callbackCount -= 1
        callbackResults[index] = { ...{ user: result1[0].username }, ...callbackResults[index], ...{ _id: value._id } }
        if (callbackCount === 0) {
          req.log('GET order/view/ Success With ', callbackResults)
          res.render("order/view", { results: callbackResults })
        } else if (callbackCount === -1) {
          req.log("Unable To Fetch Req Product Name")
          req.flash("error", "Error Fetching Orders")
          res.redirect("/")
        }
      })
      dbHandler.db.Products.find({ _id: new mongodb.ObjectId(value.product) }).toArray((error1, result1) => {
        if (error1) callbackCount = -1
        callbackCount -= 1
        callbackResults[index] = { ...{ product: result1[0].name, id: value.product, description: value.description, status: value.status }, ...callbackResults[index] }
        if (callbackCount === 0) {
          req.log('GET order/view/ Success With ', callbackResults)
          res.render("order/view", { results: callbackResults })
        } else if (callbackCount === -1) {
          req.log("Unable To Fetch Req Product Name")
          req.flash("error", "Error Fetching Orders")
          res.redirect("/")
        }
      })
      return null
    })
    return null
  })
  return null
})

route.get("/mine", (req, res) => {
  if (req.user === undefined) {
    req.log('GET order/mine/ Failed With ' + req.user)
    req.flash("error", "Login A Buyer Account")
    return res.redirect('/')
  } else if (req.user.buyer === 'buyer') {
    req.log('GET order/mine/ Failed With ' + req.user.role)
    req.flash("error", "Login A Buyer Account")
    return res.redirect('/')
  }

  dbHandler.db.Orders.find({ user: new mongodb.ObjectId(req.user._id) }).toArray((error, result) => {
    if (error) {
      req.log('GET order/mine/ Failed With ' + error)
      req.flash("error", "Unable To Req DB Account")
      return res.redirect('/')
    }
    const callbackResults = []
    let callbackCount = result.length
    result.map((value, index) => {
      dbHandler.db.Products.find({ _id: new mongodb.ObjectId(value.product) }).toArray((error1, result1) => {
        if (error1) callbackCount = -1
        callbackCount -= 1
        callbackResults[index] = { user: req.user.name, product: result1[0].name, id: value.product, description: value.description, status: value.status }
        if (callbackCount === 0) {
          req.log('GET order/mine/ Success With ' + req.user._id, callbackResults)
          res.render("order/view", { results: callbackResults })
        } else if (callbackCount === -1) {
          req.log("Unable To Fetch Req Product Name")
          req.flash("error", "Error Fetching Orders")
          res.redirect("/")
        }
      })
      return null;
    })
    if (result.length === 0) return res.render("order/view", { results: [] });
    return null;
  })
  return null;
})

route.post("/create/:id", (req, res) => {
  req.log('POST /order/create' + req.params.id)
  if (req.user === undefined) {
    req.log('POST /order/create' + req.params.id + " Failed With " + req.user)
    req.flash("error", "Login A Buyer Account")
    return res.redirect('/')
  } else if (req.user.buyer === 'buyer') {
    req.log('POST /order/create' + req.params.id + " Failed With " + req.user.role)
    req.flash("error", "Login A Buyer Account")
    return res.redirect('/')
  }
  try {
    dbHandler.db.Products.find({ _id: new mongodb.ObjectId(req.params.id) }).toArray((error1, result1) => {
      if (error1 || result1.length !== 1) {
        req.log('POST /order/create' + req.params.id + " Not Found ",error1)
        req.flash("error", "Product Not Found")
        return res.redirect('/')
      }
      if (result1[0].stock<=0) {
        req.log('POST /order/create' + req.params.id + " No Stock")
        req.flash("error", "Product is Out Of Stock")
        return res.redirect('/')
      }
      dbHandler.db.Products.update({ _id: new mongodb.ObjectId(req.params.id) },{$inc: {stock: -1}},(error2) => {
        if (error2) {
          req.log('POST /order/create' + req.params.id + " Not Found ",error2)
          req.flash("error", "Product Not Found")
          return res.redirect('/')
        }
        dbHandler.db.Orders.insertOne({ user: req.user._id, product: new mongodb.ObjectId(req.params.id), description: new Date(), status: 'Placed' }, (error, result) => {
          if (error) {
            req.log('POST /create/' + req.params.id + " Failed With " + error)
            req.flash("error", "Unable To Req DB Account")
            return res.redirect('/')
          }
          req.log('POST /create/' + req.params.id + " Success With " + result)
          req.flash("success", "Order Placed Successfully")
          return res.redirect('/')
        })
        return null
      })
      return null
    })
  } catch (err) {
    req.flash("error", "Product Not Found")
    return res.redirect('/')
  }
  return null
})

route.post("/deliver/:id", (req, res) => {
  if (req.user === undefined) {
    req.log('GET order/view/ Failed With ' + req.user)
    req.flash("error", "Login A Courier Account")
    return res.redirect('/')
  } else if (req.user.buyer === 'courier') {
    req.log('GET order/view/ Failed With ' + req.user.role)
    req.flash("error", "Login A Courier Account")
    return res.redirect('/')
  }
  try {
    dbHandler.db.Orders.find({ _id: new mongodb.ObjectId(req.params.id) }).toArray((error1, result1) => {
      if (error1) {
        req.log('GET order/view/ Failed With ' + result1)
        req.flash("error", "Something Went Wrong Querying DB")
        return res.redirect('/')
      } else if (result1.length !== 1) {
        req.log('GET order/view/ Failed With ' + result1)
        req.flash("error", "404 Not Found")
        return res.redirect('/')
      } else if (result1[0].status !== 'Placed') {
        req.log('GET order/view/ Failed With ' + result1)
        req.flash("error", "Order Already Delivered")
        return res.redirect('/')
      }
      dbHandler.db.Orders.update({ _id: new mongodb.ObjectId(req.params.id) }, { $set: { status: "Delivered", description: new Date() + " by " + req.user.username } }, (error, result) => {
        if (error) {
          req.log('GET order/view/ Failed With ' + result)
          req.flash("error", "Something Went Wrong Updating DB")
          return res.redirect('/')
        }
        req.log('GET order/view/ Success With ' + result)
        req.flash("success", "Order Delivered")
        return res.redirect('/order/view')
      })
      return null
    })
  } catch (err) {
    req.flash("error", "Order Not Found")
    return res.redirect('/')
  }
  return null
})
module.exports = route;