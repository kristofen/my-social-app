// requires
var production = ((process.env.NODE_ENV || 'dev') === 'production');
if (production) require('newrelic');
var express = require('express');
var session = require('express-session');
var app = express();
var http = require('http').Server(app);
var mongoose = require('mongoose');
var passport = require('passport');
var expressValidator = require('express-validator');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var userAgent = require('express-useragent');

// config 
var config = require('./config/config');
var pass = require('./config/passport');

// controllers
var ctrlHome = require('./controllers/home');
var ctrlUser = require('./controllers/user');
var ctrlContact = require('./controllers/contact');


// database
mongoose.connect(config.db);
mongoose.connection.on('error', function () {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

// port
var CT_PORT = 80;
if (!production) CT_PORT = 3000;

// views
app.set('views', './views');
app.set('view engine', 'jade');

// locals
app.locals.application = config.application;

// middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.sessionSecret,
  store: new MongoStore({
    url: config.db,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));
app.use(userAgent.express());

// route - Home
app.get('/', ctrlHome.getHome);
// route - Login
app.get('/login', ctrlUser.getLogin);
app.post('/login', ctrlUser.postLogin);
// route - SignUp
app.get('/signup', ctrlUser.getSignUp);
app.post('/signup', ctrlUser.postSignUp);
// route - Logout
app.get('/logout', ctrlUser.getLogout);
// route - Account - Protected
app.get('/account', pass.isAuth, ctrlUser.getAccount);
app.post('/account', pass.isAuth, ctrlUser.postAccount);
app.get('/account/unlink/:provider', pass.isAuth, ctrlUser.getOauthUnlink);
// route forgot password
app.get('/forgot', ctrlUser.getForgot);
app.post('/forgot', ctrlUser.postForgot);
// route reset password
app.get('/reset/:token', ctrlUser.getReset);
app.post('/reset/:token', ctrlUser.postReset);


//route contact
app.get('/contact', ctrlContact.getContact);
app.post('/contact', ctrlContact.postContact);



/**
 * Authentication
 */

//instagram
app.get('/auth/instagram', passport.authenticate('instagram'));
app.get('/auth/instagram/callback', passport.authenticate('instagram', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

//facebook
app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email', 'user_location']
}));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

//github
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

//goole
app.get('/auth/google', passport.authenticate('google', {
  scope: 'profile email'
}));
app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

// twitter
app.get('/auth/twitter', passport.authenticate('twitter'));
app.get('/auth/twitter/callback', passport.authenticate('twitter', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});

// linkedIn
app.get('/auth/linkedin', passport.authenticate('linkedin', {
  state: 'SOME STATE'
}));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  failureRedirect: '/login'
}), function (req, res) {
  res.redirect(req.session.returnTo || '/');
});



http.listen(CT_PORT, function () {
  console.log('listening on port ' + CT_PORT + ' ...');
});