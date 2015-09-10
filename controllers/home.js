// home.js
var config = require("../config/config");

exports.getHome = function (req, res) {
  var data = {
    user: req.user
  };
  var view = 'home';
  res.render(view, data);
};