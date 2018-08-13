const express = require('express')

const app = express();

app.set('views','./views')
app.set('view engine','pug')

app.get("/", (req, res)=>{
    res.render("index")
})

app.listen(3000,()=>{
    console.log("Server Started At Port 3000");
})