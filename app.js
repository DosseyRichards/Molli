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
var compression = require('compression');




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
app.use(compression());
///serve videos 
app.use('/videos', express.static(__dirname + '/uploads'));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json({limit: "500mb"}));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit:500000}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'static_home_page')));

app.use(function (req, res, next) {
  // You could also wrap this in the `if (req.method === 'OPTIONS')` as in the cors-options-node.js example
  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, CONNECT');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  next();
});
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());




///////Main Routes For Web Application
app.get('/', function(req, res, next){ res.sendFile(__dirname + '/static_home_page/index.html');  });
app.post('/login', passport.authenticate('local'),function(req, res, next){res.json(req.user)});
app.get('/login', homeController.getLogin);
app.get('/dashboard', userController.getDashboard);
app.get('/montage/recent', userController.getRecentMontage);
app.get('/montage/new', userController.getNewMontage);
app.post('/montage/new',upload.array('videos'), userController.postNewMontage);
app.get('/montage/watch/:this_montage', userController.getMontage);

////////////////////////////////Routes For API 
/*app.get('/api/', apiController.getHome);
*/////authentication with token
app.get('/api/', function(req, res, next){ res.send('API for Molli');  });
app.post('/api/login', upload.array('jijijiggugdsodsoxk'), config.signUserWithToken);
app.post('/api/sign_up', upload.array('jijijiggugdsodsoxk'), apiController.registerUser);
app.post('/api/montage/new', upload.fields([{ name: 'videos'}, {name:'thumbnail_image'}]), apiController.verifyAndSupplyTokenForMontage, apiController.postNewMontage);
app.get('/api/montage/recent', apiController.getRecentMontage);
app.get('/api/montage/recent/page/:page', apiController.getMoreRecentMontage);
app.get('/api/montage/popular', apiController.getPopularMontage);
app.get('/api/montage/popular/page/:page', apiController.getMorePopularMontage);
app.get('/api/montage/watch/:this_montage', apiController.getMontage);
app.get('/api/montage/my_montages/page/:page', apiController.verifyAndSupplyToken, apiController.getMoreUserMontage);



//////////////////////////////...........Test Route........../////////////////////////////////

app.get('/api/account_details', apiController.verifyAndSupplyToken, function(req, res, next){
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
