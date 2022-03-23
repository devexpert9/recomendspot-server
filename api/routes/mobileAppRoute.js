"use strict";

module.exports = function (app) {
  // app api's start
  var user = require("../controllers/userCtrl");
  app.route("/registerUser").post(user.signup);

  var updateProfile = require("../controllers/userCtrl");
  app.route("/updateProfile").post(user.updateProfile);

  var updatePassword = require("../controllers/userCtrl");
  app.route("/updatePassword").post(user.updatePassword);

  var getProfile = require("../controllers/userCtrl");
  app.route("/getProfile").post(user.getProfile);

  var userlogin = require("../controllers/userCtrl");
  app.route("/loginUser").post(userlogin.login);

  var forgotPassword = require("../controllers/userCtrl");
  app.route("/forgotPassword").post(forgotPassword.forgot_password);

  var updateuser = require("../controllers/userCtrl");
  app.route("/addFriend").post(updateuser.add_friend);

  var updateuser = require("../controllers/userCtrl");
  app.route("/removeFriend").post(updateuser.remove_friend);

  var updateuser = require("../controllers/userCtrl");
  app.route("/influencerProfile").post(updateuser.influencer_profile);

  var updateuser = require("../controllers/userCtrl");
  app.route("/followingListingTab").post(updateuser.following_listing_tab);

  var updateuser = require("../controllers/userCtrl");
  app.route("/followersListingTab").post(updateuser.followers_listing_tab);

  var updateuser = require("../controllers/userCtrl");
  app
    .route("/update_user_and_cover_image")
    .post(updateuser.update_user_and_cover_image);

  var updateuser = require("../controllers/userCtrl");
  app.route("/social_login").post(updateuser.social_login);

  var updateuser = require("../controllers/userCtrl");
  app.route("/usersListWeb").post(updateuser.users_list_web);

  var updateuser = require("../controllers/userCtrl");
  app.route("/recentUsersListWeb").post(updateuser.recent_users_list_web);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/scrapUrl").post(addRecc.scrapUrl);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/addRecc").post(addRecc.add_recc);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/addFeedback").post(addRecc.addFeedback);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/friendsrecommendations").post(addRecc.friendsRecommendations);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/getAllFriendSuggestions").post(addRecc.getAllFriendSuggestions);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/deleteRecc").post(addRecc.delete_recc);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/updateRecc").post(addRecc.update_recc);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/getAllRecc").post(addRecc.get_all_recc);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/getAllLocalRecc").post(addRecc.get_all_local_recc);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/getAllLocalfilterRecc").post(addRecc.filter_local_recc);

  var filterSearch = require("../controllers/reccomandationCtrl");
  app.route("/filterSearch").post(filterSearch.filter_search);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/getAllSavedRecc").post(addRecc.get_saved_recc);

  // var addRecc = require('../controllers/reccomandationCtrl');
  //     app.route('/getSearchedAllRecc')
  //     .post(addRecc.get_searched_all_recc)

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/addRemoveRecc").post(addRecc.add_remove_fav_recc);

  var addRecc = require("../controllers/reccomandationCtrl");
  app.route("/uploadReccImage").post(addRecc.upload_recc_image);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/addLike").post(post.addLike);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/deleteLike").post(post.deleteLike);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/addDisLike").post(post.addDisLike);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/deleteDisLike").post(post.deleteDisLike);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/addComment").post(post.addComment);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/deleteComment").post(post.deleteComment);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/postDetail").post(post.post_detail);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/recc_posts_list").post(post.recc_posts_list);

  var post = require("../controllers/reccomandationCtrl");
  app.route("/getComments").post(post.comments_list);

  var category = require("../controllers/reccomandationCtrl");
  app.route("/listNotification").post(category.list_notification);

  var category = require("../controllers/reccomandationCtrl");
  app.route("/readNotification").post(category.read_notification);

  var category = require("../controllers/reccomandationCtrl");
  app.route("/notificationCount").post(category.notification_count);
};
