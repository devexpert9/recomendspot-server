"use strict";

module.exports = function (app) {
  var user = require("../controllers/userCtrl");
  app.route("/addUser").post(user.signup);

  var adminlogin = require("../controllers/adminCtrl");
  app.route("/loginAdmin").post(adminlogin.admin_login);

  var updateUserImage = require("../controllers/userCtrl");

  //********************* ForGot password ************************
  var forgotPassword = require("../controllers/userCtrl");
  app.route("/forgotpassword").post(forgotPassword.forgot_password);
};
