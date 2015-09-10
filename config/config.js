module.exports = {

  db: process.env.MONGODB || 'mongodb://localhost:27017/my-social-app',

  sessionSecret: process.env.SESSION_SECRET || 'this is my session secret Yooo',

  application: {
    name: 'MySocialApp',
    description: 'My Social App',
    author: 'Christophe Guyot'
  }

};