"use strict";

var mongoose = require("mongoose"),
  multer = require("multer"),
  constants = require("../constants/constants"),
  friends = mongoose.model("friends"),
  likes = mongoose.model("like"),
  dislikes = mongoose.model("dislike"),
  admin = mongoose.model("admin"),
  comments = mongoose.model("comment"),
  categories = mongoose.model("category"),
  plaform = mongoose.model("platform"),
  subcategories = mongoose.model("subcategory"),
  favourites = mongoose.model("favourites"),
  notification = mongoose.model("notification"),
  reccomandation = mongoose.model("reccomandations"),
  users = mongoose.model("users");
const errors = ["", null, undefined];
var path = require("path");
// var storage = multer.diskStorage({
//    destination: function(req, file, cb) {
//        cb(null, '../images/')
//    },
//    filename: function(req, file, cb) {
//         var fileExtn = file.originalname.split('.').pop(-1);
//        cb(null, new Date().getTime() + '.' + fileExtn)
//        // var fileName = file.originalname.split('.');
//        // cb(null, fileName[0] + '-' + Date.now() + '.jpg')
//        // ////console.log('filename', fileName)
//    }
// });
// var upload = multer({ storage: storage }).single('image');

// var Cryptr = require('cryptr'),
//     cryptr = new Cryptr(constants.ENCRYPTION_SALT);

var FCM = require("fcm-node");
var serverKey =
  "AAAAL2kzemI:APA91bGv518f9J7FgmSpyMWIKQyvaqT68IuG_DoJd2OFtPIJw8aVuCgy9OVrC5JcCYyZDGEj3bbmibtc1X_cN0GFjtgQhc6Cxr8YziBvHlSBaGSbex0PfF5NbDVpaSfqLvv_-tjAXmke"; //put your server key here
var fcm = new FCM(serverKey);
// const bcrypt = require('bcrypt');
//****************  create_user_function ****************************
exports.signup = function (req, res) {
  users.findOne({ email: req.body.email }, function (err, user) {
    if (user == null) {
      var new_user = new users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        image: null,
        cover_image: null,
        contact: req.body.contact,
        location: req.body.location,
        website: req.body.website,
        fcm_token: req.body.fcm_token,
        medium: "simple",
        social_id: "",
        created_on: new Date(),
        first_login: "false",
      });

      new_user.save(function (err, users) {
        saveNotification(
          "",
          req.body.name + " registered successfully",
          users._id,
          "",
          "register",
          users._id,
          users
        );

        res.send({
          data: {
            name: users.name,
            email: users.email,
            contact: users.contact,
            image: users.image,
            cover_image: users.cover_image,
            _id: users._id,
            fcm_token: users.fcm_token,
            medium: users.medium,
            first_login: users.first_login,
          },
          status: 1,
          error: "User registered successfully!",
        });
      });
    } else {
      res.send({
        status: 0,
        data: null,
        error: "Email already exist in our system!",
      });
    }
  });
};

/***********************CHECK USER EXISTANCE*************************/
exports.check_user_existance = function (req, res) {
  users.findOne(
    { medium: req.body.medium, social_id: req.body.social_id },
    function (err, check) {
      if (check == null) {
        res.send({
          error: err,
          status: 0,
          data: null,
          msg: "user not exists",
        });
      } else {
        res.send({
          error: null,
          msg: "already exits",
          status: 1,
          data: check,
        });
      }
    }
  );
};

/************************APP USER SOCIAL LOGIN************************/
exports.social_login = function (req, res) {
  users.findOne(
    { /*medium:req.body.medium, */ social_id: req.body.social_id },
    function (err, check) {
      if (check == null) {
        var new_user = new users({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          image: req.body.image,
          cover_image: null,
          contact: req.body.contact,
          location: req.body.location,
          website: req.body.website,
          fcm_token: req.body.fcm_token,
          medium: req.body.medium,
          social_id: req.body.social_id,
          first_login: "false",
        });

        new_user.save(function (err, user) {
          if (user == null) {
            res.send({
              error: err,
              status: 0,
              data: null,
            });
          } else {
            res.send({
              error: null,
              msg: "User registered successfully!",
              status: 1,
              data: {
                name: user.name,
                email: user.email,
                contact: user.contact,
                image: user.image,
                cover_image: user.cover_image,
                _id: user._id,
                fcm_token: user.fcm_token,
                medium: user.medium,
                first_login: users.first_login,
              },
            });
          }
        });
      } else {
        users.update(
          { social_id: req.body.social_id },
          { $set: { fcm_token: req.body.fcm_token, first_login: "true" } },
          { new: true },
          function (err, save) {
            res.send({
              error: "Logged In successfully!",
              status: 1,
              data: {
                name: check.name,
                email: check.email,
                contact: check.contact,
                image: check.image,
                cover_image: check.cover_image,
                _id: check._id,
                fcm_token: check.fcm_token,
                medium: check.medium,
                first_login: "true",
              },
            });
          }
        );
      }
    }
  );
};

//**************** User_login_function ******************
exports.login = function (req, res) {
  users.findOne({ email: req.body.email }, function (err, usercheck) {
    if (usercheck != null) {
      users.findOne(
        { email: req.body.email, password: req.body.password },
        function (err, user) {
          if (user == null) {
            res.send({
              status: 0,
              data: null,
              error: "Invalid credentials.",
            });
          } else {
            users.update(
              { _id: user._id },
              { $set: { fcm_token: req.body.fcm_token, first_login: "true" } },
              { new: true },
              function (err, save) {
                res.json({
                  status: 1,
                  data: {
                    name: user.name,
                    email: user.email,
                    contact: user.contact,
                    image: user.image,
                    cover_image: user.cover_image,
                    _id: user._id,
                    fcm_token: req.body.fcm_token,
                    medium: user.medium,
                    location: user.location,
                    website: user.website,
                    first_login: user.first_login,
                  },
                  error: "Logged In successfully!",
                });
              }
            );
          }
        }
      );
    } else {
      res.json({
        error: null,
        status: 0,
        error: "Provided email address does not exist in our system",
      });
    }
  });
};

// //******************** Forgot_password_function ************************
exports.forgot_password = function (req, res) {
  var password;
  users.findOne({ email: req.body.email }, function (err, user) {
    if (user) {
      if (user.medium != "simple") {
        password = randomString();
        users.update(
          { email: req.body.email },
          { $set: { password: password, medium: "simple" } },
          function (err, usersocial) {}
        );
      } else {
        password = user.password;
      }

      var string = "Don" + "'" + "t worry, we all forget sometimes";
      var fs = require("fs"); // npm install fs
      var readStream = fs.createReadStream(
        path.join(__dirname, "../templates") + "/forgotpassword.html",
        "utf8"
      );
      let dynamic_data = "";
      readStream
        .on("data", function (chunk) {
          dynamic_data += chunk;
        })
        .on("end", function () {
          var helper = require("sendgrid").mail;
          var fromEmail = new helper.Email(
            "no-reply@favreet.com" /*'priyankasharma4010@gmail.com'*/,
            "Forget Password"
          );
          var toEmail = new helper.Email(req.body.email);
          //var toEmail = new helper.Email('gurmukhindiit@gmail.com');
          var subject = "Forgot Password Request";

          dynamic_data = dynamic_data.replace("#STRING#", string);
          dynamic_data = dynamic_data.replace("#NAME#", user.name);
          dynamic_data = dynamic_data.replace("#EMAIL#", user.email);
          dynamic_data = dynamic_data.replace("#PASSWORD#", password);
          var content = new helper.Content("text/html", dynamic_data);

          var mail = new helper.Mail(fromEmail, subject, toEmail, content);
          // var sg = require('sendgrid')(constants.SENDGRID_API_ID);
          var sg = require("sendgrid")(
            "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"
          );
          var request = sg.emptyRequest({
            method: "POST",
            path: "/v3/mail/send",
            body: mail.toJSON(),
          });
          sg.API(request, function (error, response) {
            if (error) {
              res.json({
                msg: "Something went wrong.Please try later.",
                status: 0,
              });
              // console.log('Error response received');
            } else {
              res.json({
                msg: "Mail has been sent successfully",
                status: 1,
                data: user,
              });
            }
          });
        });
    } else {
      res.json({
        error: null,
        status: 0,
        msg: "Provided email address does not exist in our system",
      });
    }
  });

  function randomString() {
    var result = "";
    var length = 6;
    var chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (var i = length; i > 0; --i)
      result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
  }
};

//******************** get_user_profile_function ************************
exports.getProfile = function (req, res) {
  if (req.body.add_user_type == "user") {
    users.findOne({ _id: req.body._id }, function (err, user) {
      if (user == null) {
        res.send({
          error: err,
          status: 0,
          data: null,
        });
      } else {
        friends.count({ userId: req.body._id }, function (err, following) {
          friends.count({ friendId: req.body._id }, function (err, follower) {
            res.json({
              error: null,
              status: 1,
              data: {
                name: user.name,
                image: user.image,
                cover_image: user.cover_image,
                _id: user._id,
                email: user.email,
                contact: user.contact,
                website: user.website,
                bio: user.bio,
                fcm_token: user.fcm_token,
                medium: user.medium,
                social_id: user.social_id,
                following: following,
                follower: follower,
                location: user.location,
                first_login: user.first_login,
                social_password_updated: user.social_password_updated,
              },
            });
          });
        });
      }
    });
  } else {
    admin.findOne({}, function (err, admindoc) {
      if (admindoc == null) {
        res.send({
          error: err,
          status: 0,
          data: null,
        });
      } else {
        res.json({
          error: null,
          status: 1,
          data: {
            name: admindoc.firstname,
            image: admindoc.image,
            cover_image: "",
            _id: admindoc._id,
            email: admindoc.email,
            contact: admindoc.contact,
            fcm_token: "",
            medium: "",
            social_id: "",
            following: 0,
            follower: 0,
          },
        });
      }
    });
  }
};

//******************** Otp_verification_function ************************
exports.otp_verification = function (req, res) {
  users.findOne({ _id: req.body._id, otp: req.body.otp }, function (err, otp) {
    if (otp == null) {
      res.send({
        error: err,
        status: 0,
        data: null,
      });
    } else {
      res.json({
        error: null,
        status: 1,
        data: otp,
      });
    }
  });
};

exports.update_user = function (req, res) {
  users.update(
    { _id: req.body._id },
    {
      $set: {
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        website: req.body.website,
        location: req.body.location,
        password: req.body.password,
      },
    },
    { new: true },
    function (err, user) {
      if (user == null) {
        res.send({
          error: err,
          status: 0,
          msg: "Try Again",
        });
      } else {
        res.json({
          error: null,
          status: 1,
          data: user,
          msg: "Profile updated successfully!",
        });
      }
    }
  );
};

exports.updateProfile = function (req, res) {
  users.findOne(
    {
      email: req.body.email,
      medium: req.body.medium,
      _id: { $ne: req.body._id },
    },
    function (err, checkemail) {
      if (checkemail == null) {
        users.findOne(
          { contact: req.body.contact, _id: { $ne: req.body._id } },
          function (err, checkcontact) {
            if (checkcontact == null) {
              users.update(
                { _id: req.body._id },
                {
                  $set: {
                    name: req.body.name,
                    email: req.body.email,
                    image: req.body.image,
                    contact: req.body.contact,
                    cover_image: req.body.cover_image,
                    location: req.body.location,
                    website: req.body.website,
                    bio: req.body.bio,
                  },
                },
                { new: true },
                function (err, user) {
                  if (user == null) {
                    res.send({
                      error: err,
                      status: 0,
                      msg: "Try Again",
                    });
                  } else {
                    res.json({
                      error: null,
                      status: 1,
                      data: user,
                      msg: "Profile updated successfully",
                    });
                  }
                }
              );
            } else {
              res.send({
                error: err,
                status: 2,
                msg: "Contact number is already exists",
              });
            }
          }
        );
      } else {
        res.send({
          error: err,
          status: 3,
          msg: "Email is already exists",
        });
      }
    }
  );
};

exports.updatePassword = function (req, res) {
  users.findOne(
    {
      social_password_updated: false,
      medium: { $ne: "simple" },
      _id: req.body._id,
    },
    function (err, checkuser) {
      if (checkuser != null) {
        users.update(
          { _id: req.body._id },
          {
            $set: {
              password: req.body.new_password,
              medium: "simple",
              social_password_updated: true,
            },
          },
          { new: true },
          function (err, user) {
            if (user == null) {
              res.send({
                error: err,
                status: 0,
                msg: "Try Again",
              });
            } else {
              res.json({
                error: null,
                status: 1,
                data: user,
                msg: "Password updated successfully",
              });
            }
          }
        );
      } else {
        users.findOne(
          { password: req.body.password, _id: req.body._id },
          function (err, checkpassword) {
            if (checkpassword != null) {
              if (checkpassword.password == req.body.new_password) {
                res.send({
                  error: err,
                  status: 3,
                  msg: "New password is same as current password",
                });
              } else {
                users.update(
                  { _id: req.body._id },
                  {
                    $set: { password: req.body.new_password, medium: "simple" },
                  },
                  { new: true },
                  function (err, user) {
                    if (user == null) {
                      res.send({
                        error: err,
                        status: 0,
                        msg: "Try Again",
                      });
                    } else {
                      res.json({
                        error: null,
                        status: 1,
                        data: user,
                        msg: "Password updated successfully",
                      });
                    }
                  }
                );
              }
            } else {
              res.send({
                error: err,
                status: 2,
                msg: "Current password is incorrect",
              });
            }
          }
        );
      }
    }
  );
};

//******************** Update user image function ************************
exports.update_user_and_cover_image = function (req, res) {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../images/");
    },
    filename: function (req, file, cb) {
      var efile = file.originalname.replace(/ /g, "_");
      efile = efile.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, "");
      cb(null, new Date().getTime() + efile);
    },
  });
  var upload = multer({ storage: storage }).single("file");

  upload(req, res, function (err) {
    // var data = JSON.parse(req.body.fields);
    //console.log(data.userId)
    // res.json({
    //     data: req.file.filename,
    //     status: 1
    //   });
    console.log(req.file.filename);
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }

    var query = {};

    if (req.body.type == "profile") {
      query = { $set: { image: req.file.filename } };
    } else if (req.body.type == "cover") {
      query = { $set: { cover_image: req.file.filename } };
    }
    users.update(
      { _id: req.body.userId },
      query,
      { new: true },
      function (err, task) {
        if (err) res.send(err);
        res.json({
          data: req.file.filename,
          status: 1,
        });
      }
    );
  });
};

exports.add_friend = function (req, res) {
  var new_user = new friends({
    userId: req.body.userId,
    friendId: req.body.friendId,
    created_on: new Date(),
  });

  new_user.save(function (err, user) {
    res.send({
      data: user,
      status: 1,
      error: "Followed successfully!",
    });

    users.findOne({ _id: req.body.userId }, function (err, send) {
      users.findOne({ _id: req.body.friendId }, function (err, recieve) {
        notification.remove(
          {
            senderId: req.body.userId,
            receiverId: req.body.friendId,
            noti_type: "follow user",
            itemId: req.body.friendId,
          },
          function (err, noti) {}
        );

        saveNotification(
          recieve.fcm_token,
          send.name + " has started following you",
          req.body.userId,
          req.body.friendId,
          "follow user",
          req.body.friendId,
          { add_user_type: "user" }
        );
      });
    });
  });
};

exports.remove_friend = function (req, res) {
  friends.remove(
    { userId: req.body.userId, friendId: req.body.friendId },
    function (err, doc) {
      notification.remove(
        {
          senderId: req.body.userId,
          receiverId: req.body.friendId,
          noti_type: "follow user",
          itemId: req.body.friendId,
        },
        function (err, noti) {}
      );

      res.send({
        data: doc,
        status: 1,
        error: "Unfollow successfully!",
      });
    }
  );
};

function youtube_parser(url) {
  var regExp =
    /^https?\:\/\/(?:www\.youtube(?:\-nocookie)?\.com\/|m\.youtube\.com\/|youtube\.com\/)?(?:ytscreeningroom\?vi?=|youtu\.be\/|vi?\/|user\/.+\/u\/\w{1,2}\/|embed\/|watch\?(?:.*\&)?vi?=|\&vi?=|\?(?:.*\&)?vi?=)([^#\&\?\n\/<>"']*)/i;
  var match = url.match(regExp);
  return match && match[1].length == 11 ? match[1] : false;
}

function getId(url) {
  var regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);

  if (match && match[2].length == 11) {
    return "https://www.youtube.com/embed/" + match[2];
  } else {
    return "error";
  }
}

exports.influencer_profile = function (req, res) {
  console.log("body = ", req.body);
  reccomandation.find(
    { user_id: req.body.userId },
    null,
    { sort: { created_at: -1 } },
    function (err, doc) {
      var counter = 0,
        dict = {},
        data = [];

      function getUserDetails() {
        console.log(doc[counter]);
        if (counter < doc.length) {
          // if(typeof(doc[counter].userId) != 'undefined'){
          users.findOne({ _id: doc[counter].user_id }, function (err, doc1) {
            likes.find({ postId: doc[counter]._id }, function (err, like) {
              dislikes.find(
                { postId: doc[counter]._id },
                function (err, dislike) {
                  comments.find(
                    { postId: doc[counter]._id },
                    function (err, comments) {
                      favourites.findOne(
                        {
                          recc_id: doc[counter]._id,
                          user_id: req.body.loggedUserId,
                        },
                        null,
                        function (err, favour) {
                          categories.findOne(
                            { _id: doc[counter].category },
                            null,
                            function (err, cat) {
                              plaform.findOne(
                                { _id: doc[counter].platform },
                                null,
                                function (err, plat) {
                                  subcategories.findOne(
                                    { _id: doc[counter].sub_category },
                                    null,
                                    function (err, subcat) {
                                      var count = 0,
                                        dic = {},
                                        commentData = [];

                                      admin.findOne(
                                        {},
                                        function (err, admindoc) {
                                          // console.log('admin', admindoc)

                                          function getname(str, user, adminc) {
                                            console.log(
                                              "adminnnnnnnnnnnnnn",
                                              adminc
                                            );
                                            if (str == "name") {
                                              if (
                                                req.body.add_user_type == "user"
                                              ) {
                                                if (
                                                  errors.indexOf(user) == -1
                                                ) {
                                                  return user.name;
                                                } else {
                                                  return "";
                                                }
                                              } else {
                                                if (
                                                  errors.indexOf(adminc) == -1
                                                ) {
                                                  return adminc.firstname;
                                                } else {
                                                  return "";
                                                }
                                              }
                                            } else if (str == "image") {
                                              if (
                                                req.body.add_user_type == "user"
                                              ) {
                                                if (
                                                  errors.indexOf(user) == -1
                                                ) {
                                                  return user.image;
                                                } else {
                                                  return "";
                                                }
                                              } else {
                                                if (
                                                  errors.indexOf(adminc) == -1
                                                ) {
                                                  return adminc.image;
                                                } else {
                                                  return "";
                                                }
                                              }
                                            } else {
                                              if (errors.indexOf(user) == -1) {
                                                return user.medium;
                                              } else {
                                                return "";
                                              }
                                            }
                                          }
                                          function getCommentUserDetails() {
                                            // console.log('comments', comments)
                                            console.log("count", count);
                                            users.findOne(
                                              { _id: comments[count].userId },
                                              function (err, user) {
                                                dic = {
                                                  comment:
                                                    comments[count].comment,
                                                  postId:
                                                    comments[count].postId,
                                                  userId:
                                                    comments[count].userId,
                                                  _id: comments[count]._id,
                                                  user: user.name,
                                                  image: user.image,
                                                  medium: user.medium,
                                                };
                                                commentData.push(dic);
                                                if (
                                                  count <
                                                  comments.length - 1
                                                ) {
                                                  count = count + 1;
                                                  getCommentUserDetails();
                                                } else {
                                                  var web_link =
                                                    doc[counter].web_link;
                                                  if (
                                                    errors.indexOf(
                                                      doc[counter].web_link
                                                    ) == -1
                                                  ) {
                                                    if (
                                                      youtube_parser(
                                                        doc[counter].web_link
                                                      ) != false
                                                    ) {
                                                      web_link = getId(
                                                        doc[counter].web_link
                                                      );
                                                    }
                                                  }
                                                  var r = (
                                                    "" + doc[counter].web_link
                                                  ).match(
                                                    /^(https?:)?\/\/[^/]+/i
                                                  );
                                                  dict = {
                                                    _id: doc[counter]._id,
                                                    type: doc[counter].type,
                                                    title: doc[counter].title,
                                                    description:
                                                      doc[counter].description,
                                                    category:
                                                      cat == null
                                                        ? ""
                                                        : cat.name,
                                                    category_id:
                                                      doc[counter].category,
                                                    platform:
                                                      plat == null
                                                        ? ""
                                                        : plat.name,
                                                    sub_category:
                                                      subcat == null
                                                        ? ""
                                                        : subcat.name,
                                                    sub_category_id:
                                                      doc[counter].sub_category,
                                                    web_link: web_link,
                                                    link: r ? r[0] : "",
                                                    user_id:
                                                      doc[counter].user_id,

                                                    tags: doc[counter].tags,

                                                    add_user_type:
                                                      doc[counter]
                                                        .add_user_type,
                                                    web_link_content:
                                                      doc[counter]
                                                        .web_link_content,
                                                    formatted_date:
                                                      doc[counter]
                                                        .formatted_date,
                                                    created_at:
                                                      doc[counter].created_at,
                                                    image:
                                                      errors.indexOf(
                                                        doc[counter].image
                                                      ) >= 0
                                                        ? ""
                                                        : doc[counter].image,
                                                    likes: like,
                                                    // dislikes: dislike,
                                                    like_count: like.length,
                                                    // comments: commentData.length == 0 ? null : commentData[commentData.length - 1],
                                                    comment_count:
                                                      commentData.length,
                                                    //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
                                                    // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
                                                    // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',

                                                    user_name: getname(
                                                      "name",
                                                      doc1,
                                                      admindoc
                                                    ),
                                                    user_image: getname(
                                                      "image",
                                                      doc1,
                                                      admindoc
                                                    ),
                                                    user_medium: getname(
                                                      "medium",
                                                      doc1,
                                                      admindoc
                                                    ),
                                                    fav:
                                                      errors.indexOf(favour) ==
                                                      -1
                                                        ? "1"
                                                        : "0",
                                                    location:
                                                      doc[counter].location,
                                                    lat: doc[counter].lat,
                                                    long: doc[counter].long,
                                                    cords: doc[counter].cords,
                                                    recc_type:
                                                      doc[counter].recc_type,
                                                    recc_contact:
                                                      doc[counter].recc_contact,
                                                  };
                                                  data.push(dict);
                                                  counter += 1;
                                                  getUserDetails();
                                                }
                                              }
                                            );
                                          }
                                          if (comments.length == 0) {
                                            var web_link =
                                              doc[counter].web_link;
                                            if (
                                              errors.indexOf(
                                                doc[counter].web_link
                                              ) == -1
                                            ) {
                                              if (
                                                youtube_parser(
                                                  doc[counter].web_link
                                                ) != false
                                              ) {
                                                web_link = getId(
                                                  doc[counter].web_link
                                                );
                                              }
                                            }
                                            var r = (
                                              "" + doc[counter].web_link
                                            ).match(/^(https?:)?\/\/[^/]+/i);
                                            dict = {
                                              _id: doc[counter]._id,
                                              type: doc[counter].type,
                                              title: doc[counter].title,
                                              description:
                                                doc[counter].description,
                                              category:
                                                cat == null ? "" : cat.name,
                                              category_id:
                                                doc[counter].category,
                                              platform:
                                                plat == null ? "" : plat.name,
                                              sub_category:
                                                subcat == null
                                                  ? ""
                                                  : subcat.name,
                                              sub_category_id:
                                                doc[counter].sub_category,
                                              web_link: web_link,
                                              link: r ? r[0] : "",
                                              user_id: doc[counter].user_id,
                                              formatted_date:
                                                doc[counter].formatted_date,
                                              add_user_type:
                                                doc[counter].add_user_type,
                                              web_link_content:
                                                doc[counter].web_link_content,
                                              created_at:
                                                doc[counter].created_at,
                                              tags: doc[counter].tags,
                                              image:
                                                errors.indexOf(
                                                  doc[counter].image
                                                ) >= 0
                                                  ? ""
                                                  : doc[counter].image,
                                              likes: like,
                                              // dislikes: dislike,
                                              // comments: commentData.length == 0 ? null : commentData[commentData.length - 1],
                                              comment_count: commentData.length,
                                              like_count: like.length,
                                              //       user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
                                              // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
                                              // user_medium: errors.indexOf(doc1) == -1 ? doc1.medium : '',
                                              user_name: getname(
                                                "name",
                                                doc1,
                                                admindoc
                                              ),
                                              user_image: getname(
                                                "image",
                                                doc1,
                                                admindoc
                                              ),
                                              user_medium: getname(
                                                "medium",
                                                doc1,
                                                admindoc
                                              ),
                                              fav:
                                                errors.indexOf(favour) == -1
                                                  ? "1"
                                                  : "0",
                                              location: doc[counter].location,
                                              lat: doc[counter].lat,
                                              long: doc[counter].long,
                                              cords: doc[counter].cords,
                                              recc_type: doc[counter].recc_type,
                                              recc_contact:
                                                doc[counter].recc_contact,
                                            };
                                            data.push(dict);
                                            counter += 1;
                                            getUserDetails();
                                          } else {
                                            getCommentUserDetails();
                                          }
                                        }
                                      );
                                    }
                                  );
                                }
                              );
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            });
          });
          // }else{
          //   counter += 1;
          //   // getUserDetails();
          // }

          // getUserDetails();
        } else {
          if (req.body.add_user_type == "user") {
            users.findOne({ _id: req.body.userId }, function (err, doc2) {
              friends.find(
                { userId: req.body.loggedUserId, friendId: req.body.userId },
                function (err, frins) {
                  res.send({
                    error: null,
                    status: 1,
                    data: { post: data, profile: doc2, friends: frins },
                  });
                }
              );
            });
          } else {
            admin.findOne({}, function (err, doc2) {
              res.send({
                error: null,
                status: 1,
                data: { post: data, profile: doc2, friends: [] },
              });
            });
          }
        }
      }
      getUserDetails();
      // res.send({
      //       error: null,
      //       status: 1,
      //       data: doc
      //     });
    }
  );
  // reccomandation.find({'user_id': req.body.userId}, null, {sort: {'created_at': -1}},function(err, doc) {
  //     var counter = 0,
  //     dict = {},
  //     data = [];

  //     function getUserDetails(){
  //       console.log(doc[counter]);
  //       if(counter < doc.length){
  //         // if(typeof(doc[counter].userId) != 'undefined'){
  //           users.findOne({'_id': doc[counter].user_id}, function(err, doc1){
  //             likes.find({'postId': doc[counter]._id}, function(err, like){
  //               comments.find({'postId': doc[counter]._id}, function(err, comments){
  //                 favourites.findOne({recc_id: doc[counter]._id, user_id: req.body.loggedUserId },null, function(err, favour) {

  //                   categories.findOne({_id: doc[counter].category },null, function(err, cat) {
  //                     admin.findOne({}, function(err, admindoc){
  //                         var count = 0,
  //                         dic= {},
  //                         commentData = [];

  //                         function getname(str, user, admin){
  //                           if(str == 'name'){
  //                             if(doc[counter].add_user_type == 'user'){
  //                               if(errors.indexOf(user) == -1){
  //                                 return user.name;
  //                               }else{
  //                                 return '';
  //                               }
  //                             }else{
  //                               if(errors.indexOf(admin) == -1){
  //                                 return admin.firstname;
  //                               }else{
  //                                 return '';
  //                               }
  //                             }
  //                           }else if(str == 'image'){
  //                             if(doc[counter].add_user_type == 'user'){
  //                               if(errors.indexOf(user) == -1){
  //                                 return user.image;
  //                               }else{
  //                                 return '';
  //                               }
  //                             }else{
  //                               if(errors.indexOf(admindoc) == -1){
  //                                 return admin.image;
  //                               }else{
  //                                 return '';
  //                               }
  //                             }
  //                           }else{
  //                             if(errors.indexOf(user) == -1){
  //                               return user.medium;
  //                             }else{
  //                               return '';
  //                             }
  //                           }
  //                         }
  //                         function getCommentUserDetails(){
  //                           users.findOne({'_id': comments[count].userId}, function(err, user){

  //                               dic = {
  //                                 comment: comments[count].comment,
  //                                 postId: comments[count].postId,
  //                                 userId: comments[count].userId,
  //                                 _id: comments[count]._id,
  //                                 user: user
  //                               };
  //                               commentData.push(dic);
  //                             if(count < comments.length){
  //                               count = count + 1;
  //                               getCommentUserDetails();
  //                             }else{
  //                               dict = {

  //                                 type: doc[counter].type,
  //                                 _id: doc[counter]._id,
  //                                 description: doc[counter].description,
  //                                 // category: doc[counter].category,
  //                                 category: cat == null  ? '' :  cat.name,
  //                                 web_link: doc[counter].web_link,
  //                                 user_id: doc[counter].user_id,
  //                                 formatted_date: doc[counter].formatted_date,
  //                                 created_at: doc[counter].created_at,
  //                                 add_user_type: doc[counter].add_user_type,
  //                                 image: doc[counter].image,
  //                                 likes: like,
  //                                 comments: commentData,
  //                                 // user: doc1,
  //                                 user_name: getname('name', doc1, admindoc),
  //                                 user_image: getname('image', doc1, admindoc),
  //                                 user: getname('', doc1, admindoc),

  //                                 // user_name: errors.indexOf(doc1) == -1 ? doc1.name :'',
  //                                 // user_image: errors.indexOf(doc1) == -1 ? doc1.image : '',
  //                                 fav: errors.indexOf(favour) == -1 ? '1' : '0'

  //                               };
  //                               data.push(dict);
  //                               counter += 1;
  //                               getUserDetails();
  //                             }
  //                           });
  //                         }

  //                         if(comments.length == 0){
  //                             dict = {
  //                               _id: doc[counter]._id,
  //                               type: doc[counter].type,
  //                               description: doc[counter].description,
  //                               category: cat == null ? '' : cat.name,
  //                               category_id: doc[counter].category,
  //                               web_link: doc[counter].web_link,
  //                               user_id: doc[counter].user_id,
  //                               formatted_date: doc[counter].formatted_date,
  //                               add_user_type: doc[counter].add_user_type,
  //                               created_at: doc[counter].created_at,
  //                               image: errors.indexOf(doc[counter].image) >= 0 ? '' : doc[counter].image ,
  //                               likes: like,
  //                               comments: commentData,
  //                               user_name: getname('name', doc1, admindoc),
  //                               user_image: getname('image', doc1, admindoc),
  //                               user_medium: getname('medium', doc1, admindoc),
  //                               fav: errors.indexOf(favour) == -1 ? '1' : '0'

  //                             };
  //                             data.push(dict);
  //                             counter += 1;
  //                             getUserDetails();
  //                           }else{
  //                             getCommentUserDetails();
  //                           }
  //                         // getCommentUserDetails();

  //                     });

  //                   });
  //                 });
  //               });
  //             });
  //           });
  //         // }else{
  //         //   counter += 1;
  //         //   // getUserDetails();
  //         // }

  //         // getUserDetails();
  //       }else{
  //         if(req.body.add_user_type == 'user'){
  //           users.findOne({'_id': req.body.userId}, function(err, doc2){
  //             friends.find({'userId': req.body.loggedUserId, friendId: req.body.userId}, function(err, frins){
  //               res.send({
  //                 error: null,
  //                 status: 1,
  //                 data: {'post': data, 'profile': doc2, friends: frins}
  //               });

  //              });
  //           });
  //         }else{
  //           admin.findOne({}, function(err, doc2){

  //               res.send({
  //                 error: null,
  //                 status: 1,
  //                 data: {'post': data, 'profile': doc2, friends: []}
  //               });
  //           });
  //         }

  //       }
  //     };
  //     getUserDetails();
  //       // res.send({
  //       //       error: null,
  //       //       status: 1,
  //       //       data: doc
  //       //     });

  // });
};

//**************** Update_user_profile_function ******************
exports.friends_listing_tab = function (req, res) {
  friends.find({ userId: req.body.userId }, function (err, doc1) {
    var data = [],
      dict = {},
      counter = 0;
    function isFriend() {
      if (counter < doc1.length) {
        users.findOne({ _id: doc1[counter].friendId }, function (err, doc) {
          dict = {
            name: doc.name,
            _id: doc._id,
            email: doc.email,
            image: doc.image,
            medium: doc.medium,
            profile: doc,
            friendData: doc1,
            isFriend: true,
          };
          data.push(dict);
          counter = counter + 1;
          isFriend();
        });
      } else {
        res.json({
          error: null,
          status: 1,
          data: data,
        });
      }
    }
    isFriend();
  });
};

//**************** Update_user_profile_function ******************
exports.following_listing_tab = function (req, res) {
  friends.find({ userId: req.body.userId }, function (err, doc1) {
    var data = [],
      dict = {},
      counter = 0;
    function isFriend() {
      if (counter < doc1.length) {
        users.findOne({ _id: doc1[counter].friendId }, function (err, doc) {
          dict = {
            name: doc.name,
            _id: doc._id,
            email: doc.email,
            image: doc.image,
            medium: doc.medium,
            profile: doc,
            friendData: doc1,
            isFriend: true,
          };
          data.push(dict);
          counter = counter + 1;
          isFriend();
        });
      } else {
        res.json({
          error: null,
          status: 1,
          data: data,
        });
      }
    }
    isFriend();
  });
};

//**************** Update_user_profile_function ******************
exports.followers_listing_tab = function (req, res) {
  friends.find({ friendId: req.body.userId }, function (err, doc1) {
    var data = [],
      dict = {},
      counter = 0;
    function isFriend() {
      if (counter < doc1.length) {
        users.findOne({ _id: doc1[counter].userId }, function (err, doc) {
          console.log("doc", doc1[counter].userId, doc);
          if (doc != null) {
            dict = {
              name: doc.name,
              _id: doc._id,
              email: doc.email,
              image: doc.image,
              medium: doc.medium,
              profile: doc,
              friendData: doc1,
              isFriend: true,
            };
            data.push(dict);
            counter = counter + 1;
            isFriend();
          } else {
            counter = counter + 1;
            isFriend();
          }
        });
      } else {
        res.json({
          error: null,
          status: 1,
          data: data,
        });
      }
    }
    isFriend();
  });
};

function saveNotification(
  token,
  noti_body,
  senderId,
  receiverId,
  noti_type,
  itemId,
  item
) {
  console.log(senderId, receiverId, noti_type, itemId);
  var new_noti = new notification({
    senderId: senderId,
    receiverId: receiverId,
    noti_type: noti_type,
    itemId: itemId,
    read: 0,
    created_on: new Date(),
  });

  new_noti.save(function (err, recc) {});

  var message = {
    //this may vary according to the message type (single recipient, multicast, topic, et cetera)
    to: token,
    collapse_key: "your_collapse_key",

    notification: {
      title: "Favreet",
      body: noti_body,
    },

    data: {
      //you can send only notification or only data(or include both)
      title: "Favreet",
      body: noti_body,
      type: noti_type,
      itemId: itemId,
      item: item,
    },
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Something has gone wrong!");
    } else {
      console.log("Successfully sent with response: ", response);
    }
  });
}

//admin user functionality

exports.userlist = function (req, res) {
  var dict = {},
    data = [],
    counter = 0;
  users
    .find({})
    .sort({ created_on: -1 })
    .exec(function (err, doc) {
      console.log("users", doc.length);

      if (doc.length == 0) {
        res.send({
          error: err,
          status: 0,
          data: doc,
        });
      } else {
        function getUserDetails() {
          console.log(doc[counter]);

          reccomandation.count(
            { user_id: doc[counter]._id },
            function (err, postcount) {
              friends.count(
                { userId: doc[counter]._id },
                function (err, followingcount) {
                  dict = {
                    name: doc[counter].name,
                    email: doc[counter].email,
                    image: doc[counter].image,
                    cover_image: doc[counter].cover_image,
                    contact: doc[counter].contact,
                    location: doc[counter].location,
                    website: doc[counter].website,
                    fcm_token: doc[counter].fcm_token,
                    medium: doc[counter].medium,
                    social_id: doc[counter].social_id,
                    _id: doc[counter]._id,
                    created_on: doc[counter].created_on,
                    postcount: postcount,
                    followingcount: followingcount,
                  };
                  data.push(dict);

                  if (counter < doc.length - 1) {
                    counter += 1;
                    getUserDetails();
                  } else {
                    res.json({
                      error: null,
                      status: 1,
                      data: data,
                    });
                  }
                }
              );
            }
          );
        }
        getUserDetails();
      }
    });
};

exports.get_user_by_id = function (req, res) {
  users.findOne({ _id: req.body.id }, function (err, users) {
    if (users == null) {
      res.send({
        error: err,
        status: 0,
        data: null,
      });
    } else {
      res.json({
        error: null,
        status: 1,
        data: users,
      });
    }
  });
};

// exports.update_user = function(req, res) {
//   users.update({_id: req.body._id},{$set:{ 'name': req.body.name, 'email':req.body.email, 'contact':req.body.contact, 'image':req.body.image} }, {new: true}, function(err, user) {
//     if(user == null){
//       res.send({
//         error: err,
//         status: 0,
//         msg:"Try Again"
//       });
//     }else{
//       res.json({
//         error: null,
//         status: 1,
//         data:user,
//         error:"User updated successfully!"
//       });
//     }
//   });
// };

//******************** Update user image function ************************
exports.update_user_image = function (req, res) {
  upload(req, res, function (err) {
    var data = JSON.parse(req.body.fields);
    //console.log(data.userId)
    console.log(req.file.filename);
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    users.update(
      { _id: req.bod.id },
      { $set: { image: req.file.filename } },
      { new: true },
      function (err, task) {
        if (err) res.send(err);
        res.json(task);
      }
    );
  });
};

//******************** Upload image function ************************
exports.upload_image = function (req, res) {
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "../images/");
    },
    filename: function (req, file, cb) {
      var efile = file.originalname.replace(/ /g, "_");
      efile = efile.replace(/[&\/\\#,+()$~%'":*?<>{}]/g, "");
      cb(null, new Date().getTime() + efile);
    },
  });
  var upload = multer({ storage: storage }).single("file");
  upload(req, res, function (err) {
    res.json(req.file.filename);
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
  });
};

exports.delete_user = function (req, res) {
  users.remove({ _id: req.body._id }, function (err, user) {
    friends.remove(
      { $or: [{ userId: req.body._id }, { friendId: req.body._id }] },
      function (err, friend) {
        reccomandation.remove({ user_id: req.body._id }, function (err, post) {
          if (user == null) {
            res.send({
              error: err,
              status: 0,
              msg: "Something went wrong.Please try again.",
            });
          } else {
            res.json({
              error: null,
              status: 1,
              data: user,
              msg: "User removed successfully!",
            });
          }
        });
      }
    );
  });
};

exports.users_list_web = function (req, res) {
  var data = [],
    dict = {},
    counter = 0;
  // users.find({ _id: {$ne : req.body._id}},function(err, user) {
  //   res.json({
  //     error: null,
  //     status: 1,
  //     data:user,
  //     msg:"Users List"
  //   });
  // });

  users.find({ _id: { $ne: req.body._id } }, function (err, user) {
    if (user.length == 0) {
      res.json({
        error: null,
        status: 1,
        data: user,
        msg: "Users List",
      });
    } else {
      console.log(req.body._id);
      function isFriend() {
        friends.find(
          { friendId: user[counter]._id, userId: req.body._id },
          function (err, doc1) {
            console.log(doc1);

            dict = {
              contact: user[counter].contact,
              cover_image: user[counter].cover_image,
              email: user[counter].email,
              image: user[counter].image,
              medium: user[counter].medium,
              name: user[counter].name,
              // password: user[counter].password,
              social_id: user[counter].social_id,
              _id: user[counter]._id,
              isFriend: doc1.length == 0 ? 0 : 1,
              friendId: doc1.length == 0 ? "" : doc1,
            };
            data.push(dict);
            if (counter < user.length - 1) {
              counter = counter + 1;
              isFriend();
            } else {
              res.json({
                error: null,
                status: 1,
                data: data,
                msg: "Users List",
              });
            }
          }
        );
      }
      isFriend();
    }
  });
};

exports.recent_users_list_web = function (req, res) {
  var data = [],
    dict = {},
    counter = 0;
  users
    .find({})
    .sort({ created_on: -1 })
    .limit(10)
    .exec(function (err, user) {
      res.json({
        error: null,
        status: 1,
        data: user,
        msg: "Users List",
      });
    });
};
