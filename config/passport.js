var passport = require('passport');
var InstagramStrategy = require('passport-instagram').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var TwitterStrategy = require('passport-twitter').Strategy;
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var OAuthStrategy = require('passport-oauth').OAuthStrategy;
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;

var async = require('async');
var User = require('../models/User');

var secrets = require('./secrets');

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

/**
 * Local strategy
 */
passport.use(new LocalStrategy({
  usernameField: 'email'
}, function (email, password, done) {
  email = email.toLowerCase();
  User.findOne({
    email: email
  }, function (err, user) {
    if (!user) return done(null, false, {
      message: 'Email ' + email + ' not found'
    });
    user.comparePassword(password, function (err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, {
          message: 'Invalid email or password.'
        });
      }
    });
  });
}));

/**
 * Instagram strategy
 */
passport.use(new InstagramStrategy(secrets.instagram, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({
      instagram: profile.id
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {
          msg: 'There is already an Instagram account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
        });
        done(err);
      } else {
        User.findById(req.user.id, function (err, user) {
          user.instagram = profile.id;
          user.tokens.push({
            kind: 'instagram',
            accessToken: accessToken
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.data.profile_picture;
          user.profile.website = user.profile.website || profile._json.data.website;
          user.save(function (err) {
            req.flash('info', {
              msg: 'Instagram account has been linked.'
            });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({
      instagram: profile.id
    }, function (err, existingUser) {
      if (existingUser) return done(null, existingUser);

      var user = new User();
      user.instagram = profile.id;
      user.tokens.push({
        kind: 'instagram',
        accessToken: accessToken
      });
      user.profile.name = profile.displayName;
      // Similar to Twitter API, assigns a temporary e-mail address
      // to get on with the registration process. It can be changed later
      // to a valid e-mail address in Profile Management.
      user.email = profile.username + "@instagram.com";
      user.profile.website = profile._json.data.website;
      user.profile.picture = profile._json.data.profile_picture;
      user.save(function (err) {
        done(err, user);
      });
    });
  }
}));

/**
 * Sign in with Facebook.
 */
passport.use(new FacebookStrategy(secrets.facebook, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({
      facebook: profile.id
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {
          msg: 'There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
        });
        done(err);
      } else {
        User.findById(req.user.id, function (err, user) {
          user.facebook = profile.id;
          user.tokens.push({
            kind: 'facebook',
            accessToken: accessToken
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.save(function (err) {
            req.flash('info', {
              msg: 'Facebook account has been linked.'
            });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({
      facebook: profile.id
    }, function (err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({
        email: profile._json.email
      }, function (err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', {
            msg: 'There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings.'
          });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.facebook = profile.id;
          user.tokens.push({
            kind: 'facebook',
            accessToken: accessToken
          });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.location = (profile._json.location) ? profile._json.location.name : '';
          user.save(function (err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy(secrets.github, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({
      github: profile.id
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {
          msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
        });
        done(err);
      } else {
        User.findById(req.user.id, function (err, user) {
          user.github = profile.id;
          user.tokens.push({
            kind: 'github',
            accessToken: accessToken
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.picture = user.profile.picture || profile._json.avatar_url;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.website = user.profile.website || profile._json.blog;
          user.save(function (err) {
            req.flash('info', {
              msg: 'GitHub account has been linked.'
            });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({
      github: profile.id
    }, function (err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({
        email: profile._json.email
      }, function (err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', {
            msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.'
          });
          done(err);
        } else {
          var user = new User();
          user.email = profile._json.email;
          user.github = profile.id;
          user.tokens.push({
            kind: 'github',
            accessToken: accessToken
          });
          user.profile.name = profile.displayName;
          user.profile.picture = profile._json.avatar_url;
          user.profile.location = profile._json.location;
          user.profile.website = profile._json.blog;
          user.save(function (err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

// Sign in with Twitter.

passport.use(new TwitterStrategy(secrets.twitter, function (req, accessToken, tokenSecret, profile, done) {
  if (req.user) {
    User.findOne({
      twitter: profile.id
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {
          msg: 'There is already a Twitter account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
        });
        done(err);
      } else {
        User.findById(req.user.id, function (err, user) {
          user.twitter = profile.id;
          user.tokens.push({
            kind: 'twitter',
            accessToken: accessToken,
            tokenSecret: tokenSecret
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location;
          user.profile.picture = user.profile.picture || profile._json.profile_image_url_https;
          user.save(function (err) {
            req.flash('info', {
              msg: 'Twitter account has been linked.'
            });
            done(err, user);
          });
        });
      }
    });

  } else {
    User.findOne({
      twitter: profile.id
    }, function (err, existingUser) {
      if (existingUser) return done(null, existingUser);
      var user = new User();
      // Twitter will not provide an email address.  Period.
      // But a person’s twitter username is guaranteed to be unique
      // so we can "fake" a twitter email address as follows:
      user.email = profile.username + "@twitter.com";
      user.twitter = profile.id;
      user.tokens.push({
        kind: 'twitter',
        accessToken: accessToken,
        tokenSecret: tokenSecret
      });
      user.profile.name = profile.displayName;
      user.profile.location = profile._json.location;
      user.profile.picture = profile._json.profile_image_url_https;
      user.save(function (err) {
        done(err, user);
      });
    });
  }
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy(secrets.google, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({
      google: profile.id
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {
          msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
        });
        done(err);
      } else {
        User.findById(req.user.id, function (err, user) {
          user.google = profile.id;
          user.tokens.push({
            kind: 'google',
            accessToken: accessToken
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.gender = user.profile.gender || profile._json.gender;
          user.profile.picture = user.profile.picture || profile._json.picture;
          user.save(function (err) {
            req.flash('info', {
              msg: 'Google account has been linked.'
            });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({
      google: profile.id
    }, function (err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({
        email: profile.emails[0].value
      }, function (err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', {
            msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.'
          });
          done(err);
        } else {
          var user = new User();
          user.email = profile.emails[0].value;
          user.google = profile.id;
          user.tokens.push({
            kind: 'google',
            accessToken: accessToken
          });
          user.profile.name = profile.displayName;
          user.profile.gender = profile._json.gender;
          user.profile.picture = profile._json.picture;
          user.save(function (err) {
            done(err, user);
          });
        }
      });
    });
  }
}));

/**
 * Sign in with LinkedIn.
 */
passport.use(new LinkedInStrategy(secrets.linkedin, function (req, accessToken, refreshToken, profile, done) {
  if (req.user) {
    User.findOne({
      linkedin: profile.id
    }, function (err, existingUser) {
      if (existingUser) {
        req.flash('errors', {
          msg: 'There is already a LinkedIn account that belongs to you. Sign in with that account or delete it, then link it with your current account.'
        });
        done(err);
      } else {
        User.findById(req.user.id, function (err, user) {
          user.linkedin = profile.id;
          user.tokens.push({
            kind: 'linkedin',
            accessToken: accessToken
          });
          user.profile.name = user.profile.name || profile.displayName;
          user.profile.location = user.profile.location || profile._json.location.name;
          user.profile.picture = user.profile.picture || profile._json.pictureUrl;
          user.profile.website = user.profile.website || profile._json.publicProfileUrl;
          user.save(function (err) {
            req.flash('info', {
              msg: 'LinkedIn account has been linked.'
            });
            done(err, user);
          });
        });
      }
    });
  } else {
    User.findOne({
      linkedin: profile.id
    }, function (err, existingUser) {
      if (existingUser) return done(null, existingUser);
      User.findOne({
        email: profile._json.emailAddress
      }, function (err, existingEmailUser) {
        if (existingEmailUser) {
          req.flash('errors', {
            msg: 'There is already an account using this email address. Sign in to that account and link it with LinkedIn manually from Account Settings.'
          });
          done(err);
        } else {
          var user = new User();
          user.linkedin = profile.id;
          user.tokens.push({
            kind: 'linkedin',
            accessToken: accessToken
          });
          user.email = profile._json.emailAddress;
          user.profile.name = profile.displayName;
          user.profile.location = profile._json.location.name;
          user.profile.picture = profile._json.pictureUrl;
          user.profile.website = profile._json.publicProfileUrl;
          user.save(function (err) {
            done(err, user);
          });
        }
      });
    });
  }
}));



// Simple route middleware to ensure user is authenticated.  Otherwise send to login page.
exports.isAuth = function passportIsAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};


// Check for admin middleware, this is unrelated to passport.js
// You can delete this if you use different method to check for admins or don't need admins
exports.isAdmin = function passportIsAdmin(req, res, next) {
  if (req.user && req.user.admin === true)
    next();
  else
    res.send(403);
};