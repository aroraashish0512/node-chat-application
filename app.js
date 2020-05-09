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

io.on('connection', function (socket) {
  /* var usersList = Array(); */
  console.log("a user connected");

  /*socket.on('disconnect', function(){
    console.log("User disconnected");
  }); */

  /* usersList[socket.id] = socket.id;
  console.log(usersList); */
  var cookief = socket.handshake.headers.cookie;

  //var cookies = cookieParser.parse(socket.handshake.headers.cookie);

  console.log(cookief);
  socket.on('simplechat', function (msg) {
    io.sockets.emit('simplechat', msg);
  });

});

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



mongoose.connect('mongodb://localhost/chatapplication');

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
