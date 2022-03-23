"use strict";

module.exports = function (app) {
  //------------------------------------------------------------------

  var userAdmin = require("../controllers/adminCtrl");
  app.route("/addUseradmin").post(userAdmin.create_user_admin);

  var userAdmin = require("../controllers/adminCtrl");
  app.route("/adminProfile").post(userAdmin.admin_profile);

  var userAdmin = require("../controllers/adminCtrl");
  app.route("/updateAdminProfile").post(userAdmin.update_admin_profile);

  var userAdmin = require("../controllers/adminCtrl");
  app.route("/listNotificationAdmin").post(userAdmin.list_notification_admin);

  var post = require("../controllers/adminCtrl");
  app.route("/postDetailAdmin").post(post.post_detail_admin);

  var post = require("../controllers/adminCtrl");
  app.route("/categoryListingAdmin").post(post.category_listing_admin);

  var post = require("../controllers/adminCtrl");
  app.route("/updateCategoryStatus").post(post.update_cat_status);

  var post = require("../controllers/adminCtrl");
  app.route("/subCategoryListingAdmin").post(post.sub_category_listing_admin);

  var post = require("../controllers/adminCtrl");
  app.route("/updateSubCategoryStatus").post(post.update_sub_cat_status);

  var userAdmin = require("../controllers/adminCtrl");
  app.route("/countries").get(userAdmin.countries);

  var userlogin = require("../controllers/userCtrl");
  app.route("/userlist").post(userlogin.userlist);

  var userlogin = require("../controllers/userCtrl");
  app.route("/updateUser").post(userlogin.update_user);

  var userlogin = require("../controllers/userCtrl");
  app.route("/deleteUser").post(userlogin.delete_user);

  var edituserimage = require("../controllers/userCtrl");
  app.route("/edituserimage/:id").post(edituserimage.update_user_image);

  app.route("/uploadImage").post(edituserimage.upload_image);

  var userlogin = require("../controllers/userCtrl");
  app.route("/getUserByID").post(userlogin.get_user_by_id);

  var adminlogin = require("../controllers/adminCtrl");
  app.route("/loginadmin").post(adminlogin.login_admin);

  //demo api

  var cat = require("../controllers/categoryCtrl");
  app.route("/send_query_email").post(cat.send_query_email);

  //demo api

  var cat = require("../controllers/categoryCtrl");
  app.route("/addcategory").post(cat.add_category);

  var cats = require("../controllers/categoryCtrl");
  app.route("/categoryexist").post(cats.category_exist);

  var cats = require("../controllers/categoryCtrl");
  app.route("/categories").post(cats.category_listing);

  var cats = require("../controllers/categoryCtrl");
  app.route("/onlycategories").post(cats.only_category_listing);

  var cats = require("../controllers/categoryCtrl");
  app.route("/deletecategory").post(cats.delete_category);

  var cats = require("../controllers/categoryCtrl");
  app.route("/updatecategory").post(cats.update_category);

  var cats = require("../controllers/categoryCtrl");
  app.route("/getcategory").post(cats.get_category);

  var cats = require("../controllers/categoryCtrl");
  app.route("/followUnfollowCategory").post(cats.follow_unfollow_category);

  var cat = require("../controllers/subCategoryCtrl");
  app.route("/addsubcategory").post(cat.add_sub_category);

  var sub_cats = require("../controllers/subCategoryCtrl");
  app.route("/subcategoryexist").post(sub_cats.sub_category_exist);

  var sub_cats = require("../controllers/subCategoryCtrl");
  app.route("/subcategories").post(sub_cats.sub_category_listing);

  var sub_cats = require("../controllers/subCategoryCtrl");
  app.route("/deletesubcategory").post(sub_cats.delete_sub_category);

  var sub_cats = require("../controllers/subCategoryCtrl");
  app.route("/updatesubcategory").post(sub_cats.update_sub_category);

  var sub_cats = require("../controllers/subCategoryCtrl");
  app.route("/getsubcategory").post(sub_cats.get_sub_category);

  var sub_cats = require("../controllers/subCategoryCtrl");
  app
    .route("/followUnfollowSubcategory")
    .post(sub_cats.follow_unfollow_sub_category);

  var cats = require("../controllers/reccomandationCtrl");
  app.route("/getAllReccAdmin").post(cats.get_all_recc_admin);

  var cats = require("../controllers/reccomandationCtrl");
  app.route("/getAllFeedback").post(cats.get_all_feedback);

  var cats = require("../controllers/reccomandationCtrl");
  app.route("/getPostComments").post(cats.get_post_comments);

  var platform = require("../controllers/platformCtrl");
  app.route("/add_platform").post(platform.add_platform);

  var platform = require("../controllers/platformCtrl");
  app.route("/platform_listing").post(platform.platform_listing);
};
