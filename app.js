var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var engine = require('ejs');
var ejsLayouts = require('express-ejs-layouts');
var expressValidator = require('express-validator');

var mongoose = require('mongoose');
var expressFlash = require('express-flash');
var expressSession = require('express-session');

var nodemailer = require("nodemailer");
var cors = require('cors');

var index = require('./routes/index');
var users = require('./routes/users');
var csvpdf = require('./routes/csvpdf');

var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(9898);

const socketUser = require('./model/SocketUser');
var os = require( 'os' );

var networkInterfaces = os.networkInterfaces();

const sockets = {};
io.on('connection', function (socket) {
  if (networkInterfaces['Wi-Fi'] && networkInterfaces['Wi-Fi'].length > 0) {
    // console.log(networkInterfaces['Wi-Fi'][networkInterfaces['Wi-Fi'].length - 1]);
  }
  sockets[socket.id] = socket;
  console.log(socket.handshake.address, '43');
  socket.emit('totalClients', {allClients:Object.keys(sockets), currentUser: socket.id});
  socket.on('simplechat', function (msg) {
    io.sockets.emit('simplechat', msg);
  });

  socket.on('disconnect', function(){
    delete sockets[socket.id];
    socket.emit('totalClients', {allClients:Object.keys(sockets)});
  });

  socket.on('simplechat', function (msg) {
    // io.sockets.emit('simplechat', msg);
    io.sockets.to(msg.receiver).emit('simplechat', msg);
  });

  socket.on('broadcastmessage', function (msg) {
    socket.broadcast.emit("broadcastmessage", msg);
    console.log(msg, 'broadcast');
  });



});

// const $ipsConnected = [];
// var count = 0;
// io.on('connection', function (socket) {
//   var $ipAddress = socket.handshake.address;
//   if (!$ipsConnected.hasOwnProperty($ipAddress)) {
//   	$ipsConnected[$ipAddress] = 1;
//   	count++;
//   	socket.emit('totalClients', {count:count});
//   }
//   console.log("client is connected");
//   console.log($ipsConnected, '61');
//   console.log(io.engine.clientsCount, 'totalCount');
  
//   /* Disconnect socket */

//   socket.on('disconnect', function() {
//   	if ($ipsConnected.hasOwnProperty($ipAddress)) {
//   		delete $ipsConnected[$ipAddress];
//       count--;
//       console.log('user disconnect from the application');
//       console.log($ipsConnected, '70');
// 	    socket.emit('totalClients', {count:count});
//   	}
//   });

//   socket.on('typing', (data)=>{
//     if(data.typing==true)
//        io.emit('typing', data)
//     else
//        io.emit('typing', data)
//   })

//   socket.on('simplechat', function (msg) {
//     io.sockets.emit('simplechat', msg);
//   });
// });


var sessionStore = new expressSession.MemoryStore;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
/* app.set('view engine', 'jade'); */
app.set('view engine', 'ejs');
app.use(ejsLayouts);
app.use(cors());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator());
app.use(expressFlash());
app.use(expressSession({
  cookie: { maxAge: 600000 },
  store: sessionStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}));

app.use('/', index);
app.use('/users', users);
app.use('/manageiostream', csvpdf);



// mongoose.connect('mongodb://localhost/chatapplication');

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
