var express = require("express") 
var app = express() 

// middleware to autoformat request to .json format
app.use(express.json())

app.get("/", (req, res) => {
    res.send("plot pals :)")
}) 

// start server 
var server = app.listen(8081, (req, res) => {
    var host = server.address().address
    var port = server.address().port
    console.log("Server running at http://%s:%s", host, port)
}) 