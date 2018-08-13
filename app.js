const express = require('express')
const Logger = require('./Logger/Logger')

const app = express();

app.set('views','./views')
app.set('view engine','pug')

app.get("/", (req, res)=>{
    res.render("index")
})

app.listen(3000,()=>{
    Logger.log("Server Started at http://localhost:3000")
})