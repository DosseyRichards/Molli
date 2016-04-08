var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var homeController = require('homeController');
var userController = require('userController');
var apiController = require('apiController');
var routes = require('./routes/index');
var users = require('./routes/users');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var config = require('config');
var app = express();
var models  = require('models');
var config = require('config');




///local strategy
passport.use(new LocalStrategy(
{
  usernameField: 'username'
},
  function(username, password, done) {
    models.user.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (user.password !=password){ return done(null, false, {message: 'Invalid password'}); }
      return done(null, user);
    });
  }
));
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});







// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    next();
});
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

///////Main Routes For Web Application
app.get('/', homeController.getHome);
app.post('/login', passport.authenticate('local'),function(req, res, next){res.json(req.user)});
app.get('/login', homeController.getLogin);
app.get('/dashboard', userController.getDashboard);
app.get('/montage/recent', userController.getRecentMontage);
app.get('/montage/new', userController.getNewMontage);
app.post('/montage/new',upload.array('videos'), userController.postNewMontage);


////////////////////////////////Routes For API 
/*app.get('/api/', apiController.getHome);
*/////authentication with token
app.post('/api/login', passport.authenticate('local', {session:false}), config.signUserWithToken);
app.post('/api/montage/new',upload.array('videos'), apiController.postNewMontage);
app.get('/api/montage/recent', apiController.getRecentMontage);
app.get('api/montage/watch/:this_montage', apiController.getMontage);

///...........Test Route........../
app.post('/api/test', apiController.verifyAndSupplyToken, function(req, res, next){
  res.json(req.decoded._doc);
});

////////////////////////




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
