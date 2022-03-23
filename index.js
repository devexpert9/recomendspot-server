  var express = require('express'),
  app = express();
  var http = require('http').Server(app);
  var io = require('socket.io')(http),
  port = process.env.PORT || 3001;

  // Allow CORS support and remote requests to the service
  app.use(function(req, res, next)
  {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
      next();
  });

  io.on('chat_message', (data) => {
     console.log('a user connected');
    io.emit('chat_message', {text: data.message, created: new Date()});    
  });
  

  app.listen(port);
  module.exports = app;
  
 console.log('todo list RESTful API server started on: ' + port);