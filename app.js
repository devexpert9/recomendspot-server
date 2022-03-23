var express = require("express"),
  app = express(),
  // var http = require('http').Server(app);
  // var io = require('socket.io')(http),
  port = process.env.PORT || 3001,
  mongoose = require("mongoose"),
  users = require("./api/models/userModel"),
  admin = require("./api/models/adminModel"),
  post = require("./api/models/reccomandationModel"),
  like = require("./api/models/likeModel"),
  chat = require("./api/models/chatModel"),
  comment = require("./api/models/commentModel"),
  category = require("./api/models/categoryModel"),
  friend = require("./api/models/friendModel"),
  feedback = require("./api/models/feedbackModel"),
  friendsrecommendations = require("./api/models/friendsRecomandationsModal"),
  bodyParser = require("body-parser"),
  multer = require("multer");

const https = require("https"),
  fs = require("fs");

const options = {
  key: fs.readFileSync("private.key"),
  cert: fs.readFileSync("certificate.crt"),
};

mongoose.Promise = global.Promise;
// var connectionUrl = 'mongodb://root:UNpEggFzVuq6@localhost:27017/chabbo?authSource=admin';
// mongoose.connect(connectionUrl);
mongoose.connect("mongodb://localhost/favreet");
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

var path = __dirname;

path = path.split("/server");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("port", port);

var routes = require("./api/routes/mobileAppRoute");
routes(app);
var webroutes = require("./api/routes/webRoutes");
webroutes(app);
app.use("/images", express.static(path[0] + "/images"));
// app.listen(port);
https.createServer(options, app).listen(port, function () {
  console.log("APIs started at " + port);
});
module.exports = app;
console.log("todo list RESTful API server started on: " + port);
