var config = require("../config/config");
var secrets = require("../config/secrets");
var passport = require('passport');
var User = require('../models/User');
var async = require('async');
var _ = require('underscore');
var fs = require('fs');
var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
var crypto = require('crypto');

var transporter = nodemailer.createTransport(smtpTransport({
  host: secrets.smtp.host,
  port: secrets.smtp.port,
  auth: {
    user: secrets.smtp.user,
    pass: secrets.smtp.password
  }
}));


exports.getAccount = function (req, res) {
  res.render('account', {
    user: req.user
  });
};

exports.postAccount = function (req, res, next) {
  if (!req.body || !req.body.txtName) return res.redirect("/");
  if (!req.user || !req.user._id) return res.redirect('/');

  User.findById(req.user._id, function (err, u) {
    if (err) {
      req.flash('errors', err);
      return res.redirect('/account');
    }
    if (!u) {
      req.flash('errors', {
        msg: 'user not found'
      });
      return res.redirect('/account');
    }
    if (!u.profile) {
      u.profile = {};
    }
    u.profile.name = req.body.txtName;
    u.save(function (err) {
      if (err) return next(err);
      req.flash('success', {
        msg: 'Sauvé!'
      });
      res.redirect('/account');
    });
  });


};

exports.getSignUp = function (req, res) {
  res.render('signup', {
    user: req.user
  });
};

exports.postSignUp = function (req, res, next) {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({
    email: req.body.email
  }, function (err, existingUser) {
    if (existingUser) {
      req.flash('errors', {
        msg: 'Un compte existe deja pour cet email.'
      });
      return res.redirect('/signup');
    }
    user.save(function (err) {
      if (err) return next(err);
      req.logIn(user, function (err) {
        if (err) return next(err);
        res.redirect('/');
      });
    });
  });
};

exports.getLogin = function (req, res) {
  res.render('login', {
    user: req.user
  });
};

exports.postLogin = function (req, res, next) {

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }

  passport.authenticate('local', function (err, user, info) {
    if (err) return next(err);
    if (!user) {
      req.flash('errors', {
        msg: info.message
      });
      return res.redirect('/login');
    }
    req.logIn(user, function (err) {
      if (err) return next(err);
      req.flash('success', {
        msg: 'Success! You are logged in.'
      });
      res.redirect(req.session.returnTo || '/');
    });
  })(req, res, next);
};


exports.getLogout = function (req, res) {
  req.logout();
  res.redirect('/');
};



/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = function (req, res, next) {
  var provider = req.params.provider;
  User.findById(req.user.id, function (err, user) {
    if (err) return next(err);

    user[provider] = undefined;
    user.tokens = _.reject(user.tokens, function (token) {
      return token.kind === provider;
    });

    user.save(function (err) {
      if (err) return next(err);
      req.flash('info', {
        msg: provider + ' account has been unlinked.'
      });
      res.redirect('/account');
    });
  });
};



/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function (req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({
        email: req.body.email.toLowerCase()
      }, function (err, user) {
        if (!user) {
          req.flash('errors', {
            msg: 'No account with that email address exists.'
          });
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      // var transporter = nodemailer.createTransport({
      //   service: 'SendGrid',
      //   auth: {
      //     user: secrets.sendgrid.user,
      //     pass: secrets.sendgrid.password
      //   }
      // });
      var mailOptions = {
        to: user.email,
        from: secrets.adminEmail,
        subject: 'Reset your password on Hackathon Starter',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      transporter.sendMail(mailOptions, function (err) {
        req.flash('info', {
          msg: 'An e-mail has been sent to ' + user.email + ' with further instructions.'
        });
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
};


/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({
      resetPasswordToken: req.params.token
    })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function (err, user) {
      if (!user) {
        req.flash('errors', {
          msg: 'Password reset token is invalid or has expired.'
        });
        return res.redirect('/forgot');
      }
      res.render('reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function (req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function (done) {
      User
        .findOne({
          resetPasswordToken: req.params.token
        })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function (err, user) {
          if (!user) {
            req.flash('errors', {
              msg: 'Password reset token is invalid or has expired.'
            });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;

          user.save(function (err) {
            if (err) return next(err);
            req.logIn(user, function (err) {
              done(err, user);
            });
          });
        });
    },
    function (user, done) {
      // var transporter = nodemailer.createTransport({
      //   service: 'SendGrid',
      //   auth: {
      //     user: secrets.sendgrid.user,
      //     pass: secrets.sendgrid.password
      //   }
      // });
      var mailOptions = {
        to: user.email,
        from: secrets.adminEmail,
        subject: 'Your Hackathon Starter password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      transporter.sendMail(mailOptions, function (err) {
        req.flash('success', {
          msg: 'Success! Your password has been changed.'
        });
        done(err);
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/');
  });
};