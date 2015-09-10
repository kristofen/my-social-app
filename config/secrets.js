/**
 * IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT
 *
 * You should never commit this file to a public repository on GitHub!
 * All public code on GitHub can be searched, that means anyone can see your
 * uploaded secrets.js file.
 *
 * I did it for your convenience using "throw away" API keys and passwords so
 * that all features could work out of the box.
 *
 * Use config vars (environment variables) below for production API keys
 * and passwords. Each PaaS (e.g. Heroku, Nodejitsu, OpenShift, Azure) has a way
 * for you to set it up from the dashboard.
 *
 * Another added benefit of this approach is that you can use two different
 * sets of keys for local development and production mode without making any
 * changes to the code.
 * IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT  IMPORTANT
 */

module.exports = {


  adminEmail: 'admin@myemail.com',

  smtp: {
    host: 'smtp.domain.com',
    port: 25,
    user: 'user@email.com',
    password: 'mdpforuser'
  },

  mailgun: {
    user: process.env.MAILGUN_USER || 'admin@email.com',
    password: process.env.MAILGUN_PASSWORD || '12354654'
  },

  mandrill: {
    user: process.env.MANDRILL_USER || 'hackathonstarterdemo',
    password: process.env.MANDRILL_PASSWORD || '1321321321'
  },

  sendgrid: {
    user: process.env.SENDGRID_USER || 'hslogin',
    password: process.env.SENDGRID_PASSWORD || '321321321'
  },

  nyt: {
    key: process.env.NYT_KEY || '321321321321'
  },

  lastfm: {
    api_key: process.env.LASTFM_KEY || '321321321321321',
    secret: process.env.LASTFM_SECRET || '2321321321321321'
  },

  facebook: {
    clientID: process.env.FACEBOOK_ID || '321321321',
    clientSecret: process.env.FACEBOOK_SECRET || '321321321321',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  },

  instagram: {
    clientID: process.env.INSTAGRAM_ID || '321321321321321',
    clientSecret: process.env.INSTAGRAM_SECRET || '321321321321321321',
    callbackURL: '/auth/instagram/callback',
    passReqToCallback: true
  },

  github: {
    clientID: process.env.GITHUB_ID || '321321321321321',
    clientSecret: process.env.GITHUB_SECRET || '3132132132132131',
    callbackURL: '/auth/github/callback',
    passReqToCallback: true
  },

  twitter: {
    consumerKey: process.env.TWITTER_KEY || '321321321321321',
    consumerSecret: process.env.TWITTER_SECRET || '321321321321',
    callbackURL: '/auth/twitter/callback',
    passReqToCallback: true
  },

  google: {
    clientID: process.env.GOOGLE_ID || '1321321321',
    clientSecret: process.env.GOOGLE_SECRET || '321321321321321321',
    callbackURL: '/auth/google/callback',
    passReqToCallback: true
  },

  linkedin: {
    clientID: process.env.LINKEDIN_ID || '321321321321321321321',
    clientSecret: process.env.LINKEDIN_SECRET || '31321321321321',
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:3000/auth/linkedin/callback',
    scope: ['r_fullprofile', 'r_emailaddress', 'r_network'],
    passReqToCallback: true
  },

  steam: {
    apiKey: process.env.STEAM_KEY || '321321321321321'
  },

  twilio: {
    sid: process.env.TWILIO_SID || '321321321321321321',
    token: process.env.TWILIO_TOKEN || '321321321321321321'
  },

  clockwork: {
    apiKey: process.env.CLOCKWORK_KEY || '321321321321321321'
  },

  stripe: {
    secretKey: process.env.STRIPE_SKEY || '321321321321321321',
    publishableKey: process.env.STRIPE_PKEY || '321321321321321321'
  },

  tumblr: {
    consumerKey: process.env.TUMBLR_KEY || '321321321321321321',
    consumerSecret: process.env.TUMBLR_SECRET || '321321321321321321',
    callbackURL: '/auth/tumblr/callback'
  },

  foursquare: {
    clientId: process.env.FOURSQUARE_ID || '321321321321321321',
    clientSecret: process.env.FOURSQUARE_SECRET || '321321321321321321',
    redirectUrl: process.env.FOURSQUARE_REDIRECT_URL || 'http://localhost:3000/auth/foursquare/callback'
  },

  venmo: {
    clientId: process.env.VENMO_ID || '321321321321321321',
    clientSecret: process.env.VENMO_SECRET || '321321321321321321',
    redirectUrl: process.env.VENMO_REDIRECT_URL || 'http://localhost:3000/auth/venmo/callback'
  },

  paypal: {
    host: 'api.sandbox.paypal.com',
    client_id: process.env.PAYPAL_ID || '321321321321321321',
    client_secret: process.env.PAYPAL_SECRET || '321321321321321321',
    returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/api/paypal/success',
    cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/api/paypal/cancel'
  },

  lob: {
    apiKey: process.env.LOB_KEY || '321321321321321321'
  },

  bitgo: {
    accessToken: process.env.BITGO_ACCESS_TOKEN || '321321321321321321'
  }
};