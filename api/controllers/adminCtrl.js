"use strict";

var mongoose = require("mongoose"),
  multer = require("multer"),
  admin = mongoose.model("admin"),
  users = mongoose.model("users"),
  friends = mongoose.model("friends"),
  likes = mongoose.model("like"),
  comments = mongoose.model("comment"),
  favourites = mongoose.model("favourites"),
  categories = mongoose.model("category"),
  subcategories = mongoose.model("subcategory"),
  notification = mongoose.model("notification"),
  reccomandation = mongoose.model("reccomandations"),
  fs = require("fs"),
  path = require("path");

const errors = ["", null, undefined];

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../images/");
  },
  filename: function (req, file, cb) {
    var fileExtn = file.originalname.split(".").pop(-1);
    cb(null, new Date().getTime() + "." + fileExtn);
  },
});

var upload = multer({ storage: storage }).single("image");
//****************  create_user_function ****************************
exports.create_user_admin = function (req, res) {
  users.findOne({ email: req.body.email }, function (err, adminuser) {
    if (adminuser == null) {
      var new_user = new users({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        image: req.body.image,
        cover_image: null,
        contact: req.body.contact,
        fcm_token: "",
        medium: "simple",
        social_id: "",
        created_on: new Date(),
      });
      new_user.save(function (err, doc) {
        if (doc == null) {
          res.send({
            data: null,
            error: "Something went wrong.Please try later.",
            status: 0,
          });
        } else {
          res.send({
            data: doc,
            status: 1,
            error: "User added successfully!",
          });
        }
      });
    } else {
      res.send({
        data: null,
        status: 0,
        error: "Email already exist in our system!",
      });
    }
  });
};

exports.login_admin = function (req, res) {
  admin.findOne(
    { email: req.body.email, password: req.body.password },
    function (err, user) {
      console.log(user);
      if (user == null) {
        res.send({
          data: null,
          status: 0,
          error: "Invaid logged in details.",
        });
      } else {
        res.send({
          status: 1,
          data: user,
          error: "You are logged in successfully.",
        });
      }
    }
  );
};

// //******************** Forgot_password_function ************************
exports.forgot_password_admin = function (req, res) {
  console.log(req.body.email);
  admin.findOne({ email: req.body.email }, function (err, user) {
    console.log("+++++" + user + "++++++");
    if (user) {
      var numsms = Math.floor(Math.random() * 90000) + 10000;
      admin.update(
        { _id: user._id },
        { $set: { otp: numsms } },
        { new: true },
        function (err, task) {
          if (task == null) {
            res.send({
              error: err,
              status: 0,
            });
          } else {
            // res.json({
            //   error: null,
            //   status: 1,
            //   data: user,
            // });
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
                  "babitaindiit@gmail.com" /*'priyankasharma4010@gmail.com'*/,
                  "Stratergy Athlete"
                );
                var toEmail = new helper.Email("babitaindiit@gmail.com");
                //var toEmail = new helper.Email('gurmukhindiit@gmail.com');
                var subject = "Forgot Password Request";

                dynamic_data = dynamic_data.replace("#STRING#", string);
                dynamic_data = dynamic_data.replace("#NAME#", user.firstname);
                dynamic_data = dynamic_data.replace("#EMAIL#", user.email);
                dynamic_data = dynamic_data.replace(
                  "#PASSWORD#",
                  user.password
                );
                var content = new helper.Content("text/html", dynamic_data);

                var mail = new helper.Mail(
                  fromEmail,
                  subject,
                  toEmail,
                  content
                );
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
          }
        }
      );
    } else {
      res.json({
        error: null,
        status: 0,
        msg: "Invalid Email Address",
      });
    }
  });
};

//******************** Otp_verification_function ************************
exports.otp_verification = function (req, res) {
  admin.findOne({ _id: req.body._id, otp: req.body.otp }, function (err, otp) {
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

//**************** Update_admin_profile_function ******************
exports.update_admin_profile = function (req, res) {
  admin.update(
    { _id: req.body.id },
    {
      $set: {
        firstname: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        address: req.body.address,
        country: req.body.country,
        state: req.body.state,
        image: req.body.image,
        password: req.body.password,
      },
    },
    { new: true },
    function (err, user) {
      console.log(user, "user");
      admin.findOne({ _id: req.body.id }, function (err, singleuser) {
        res.json({
          status: 1,
          data: singleuser,
          msg: "Profile updated successfully!",
        });
      });
      // if(user.nModified != 1){
      //   res.send({
      //     error: err,
      //     status: 0,
      //     msg:"Try Again"
      //   });
      // }else{
      //     admin.findOne({_id:req.body.id}, function(err, singleuser) {
      //     res.json({
      //     status: 1,
      //     data:singleuser,
      //     msg:"Profile updated successfully!"
      //   });
      //     })
      //  }
    }
  );
};
//******************** Upload adminimage function ************************
exports.upload_admin_image = function (req, res) {
  upload(req, res, function (err) {
    res.json(req.file.filename);
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
  });
};
// //**************** Update_admin_password_function ******************
exports.update_admin_password = function (req, res) {
  console.log(req.body);
  admin.findOne({ _id: req.body._id }, function (err, user) {
    console.log(user);
    if (user == null) {
      res.send({
        error: err,
        status: 0,
        data: null,
        msg: "Invalid user!",
      });
    } else {
      console.log(user.password, req.body.oldpassword);
      if (user.password == req.body.oldpassword) {
        admin.update(
          { _id: req.body._id },
          { $set: { password: req.body.newpassword } },
          { new: true },
          function (err, change) {
            if (change == null) {
              res.send({
                error: err,
                status: 0,
                data: null,
                msg: "Try again !!",
              });
            } else {
              res.json({
                error: null,
                status: 1,
                data: change,
                msg: "Password updated successfully!",
              });
            }
          }
        );
      } else {
        res.json({
          error: null,
          status: 0,
          data: user,
          msg: "The old password you have entered is incorrect.",
        });
      }
    }
  });
};

//******************** Otp_verification_function ************************
exports.admin_profile = function (req, res) {
  admin.findOne({ _id: req.body._id }, function (err, doc) {
    if (doc == null) {
      res.send({
        error: err,
        status: 0,
        data: null,
      });
    } else {
      res.json({
        error: null,
        status: 1,
        data: doc,
      });
    }
  });
};

exports.countries = function (req, res) {
  var translation = fs.readFileSync(
    path.join(__dirname, "../json/countries.json"),
    ""
  );
  var result = JSON.parse(translation);
  res.json(result);
};

exports.list_notification_admin = function (req, res) {
  notification
    .find({})
    .sort({ created_on: -1 })
    .exec(function (err, doc) {
      var counter = 0,
        data = [],
        dict = {};
      function getUserDetails() {
        if (counter < doc.length) {
          users.findOne({ _id: doc[counter].senderId }, function (err, sender) {
            users.findOne(
              { _id: doc[counter].receiverId },
              function (err, receiver) {
                dict = {
                  senderId: doc[counter].senderId,
                  receiverId: doc[counter].receiverId,
                  noti_type: doc[counter].noti_type,
                  created_on: doc[counter].created_on,
                  sender_name: errors.indexOf(sender) == -1 ? sender.name : "",
                  sender_image:
                    errors.indexOf(sender) == -1 ? sender.image : "",
                  sender_medium:
                    errors.indexOf(sender) == -1 ? sender.medium : "",
                  receiver_name:
                    errors.indexOf(receiver) == -1 ? receiver.name : "",
                  receiver_image:
                    errors.indexOf(receiver) == -1 ? receiver.image : "",
                  receiver_medium:
                    errors.indexOf(receiver) == -1 ? receiver.medium : "",
                  read: doc[counter].read,
                  itemId: doc[counter].itemId,
                  _id: doc[counter]._id,
                };
                data.push(dict);
                counter += 1;
                getUserDetails();
              }
            );
          });
        } else {
          res.send({
            data: data,
            status: 1,
            error: null,
          });
        }
      }

      getUserDetails();
    });
};

exports.post_detail_admin = function (req, res) {
  reccomandation.find(
    { _id: req.body.postId },
    null,
    { sort: { created_on: -1 } },
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
              comments.find(
                { postId: doc[counter]._id },
                function (err, comments) {
                  categories.findOne(
                    { _id: doc[counter].category },
                    null,
                    function (err, cat) {
                      var count = 0,
                        dic = {},
                        commentData = [];

                      admin.findOne({}, function (err, admindoc) {
                        // console.log('admin', admindoc)

                        function getname(user, adminc) {
                          console.log("adminnnnnnnnnnnnnn", adminc);
                          if (doc[counter].add_user_type == "user") {
                            if (errors.indexOf(user) == -1) {
                              return user;
                            } else {
                              return "";
                            }
                          } else {
                            if (errors.indexOf(adminc) == -1) {
                              return adminc;
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
                                comment: comments[count].comment,
                                postId: comments[count].postId,
                                userId: comments[count].userId,
                                _id: comments[count]._id,
                                user: user.name,
                                image: user.image,
                                medium: user.medium,
                              };
                              commentData.push(dic);
                              if (count < comments.length - 1) {
                                count = count + 1;
                                getCommentUserDetails();
                              } else {
                                dict = {
                                  _id: doc[counter]._id,
                                  type: doc[counter].type,
                                  description: doc[counter].description,
                                  category: cat == null ? "" : cat.name,
                                  category_id: doc[counter].category,
                                  web_link: doc[counter].web_link,
                                  user_id: doc[counter].user_id,
                                  formatted_date: doc[counter].formatted_date,
                                  created_at: doc[counter].created_at,
                                  image:
                                    errors.indexOf(doc[counter].image) >= 0
                                      ? ""
                                      : doc[counter].image,
                                  likes: like,
                                  comments: commentData,
                                  user: getname(doc1, admindoc),
                                };
                                data.push(dict);
                                counter += 1;
                                getUserDetails();
                              }
                            }
                          );
                        }
                        if (comments.length == 0) {
                          dict = {
                            _id: doc[counter]._id,
                            type: doc[counter].type,
                            description: doc[counter].description,
                            category: cat == null ? "" : cat.name,
                            category_id: doc[counter].category,
                            web_link: doc[counter].web_link,
                            user_id: doc[counter].user_id,
                            formatted_date: doc[counter].formatted_date,
                            created_at: doc[counter].created_at,
                            image:
                              errors.indexOf(doc[counter].image) >= 0
                                ? ""
                                : doc[counter].image,
                            likes: like,
                            comments: commentData,
                            user: getname(doc1, admindoc),
                          };
                          data.push(dict);
                          counter += 1;
                          getUserDetails();
                        } else {
                          getCommentUserDetails();
                        }
                      });
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
          res.send({
            error: null,
            status: 1,
            data: data,
          });
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
};

exports.category_listing_admin = function (req, res) {
  var dict = {},
    data = [],
    counter = 0;
  categories
    .find({}, null, { sort: { created_on: -1 } })
    .exec(function (err, doc) {
      if (doc.length == 0) {
        res.send({
          error: err,
          status: 0,
          data: doc,
        });
      } else {
        function getData() {
          subcategories
            .count({ cat_id: doc[counter]._id }, null, {
              sort: { created_on: -1 },
            })
            .exec(function (err, subcatcount) {
              dict = {
                created_on: doc[counter].created_on,
                status_for_platform: doc[counter].status_for_platform,
                follow_status: doc[counter].follow_status,
                name: doc[counter].name,
                status: doc[counter].status,
                _id: doc[counter]._id,
                subcatcount: subcatcount,
              };
              data.push(dict);
              if (counter < doc.length - 1) {
                counter = counter + 1;
                getData();
              } else {
                res.send({
                  error: err,
                  status: 0,
                  data: data,
                });
              }
            });
        }
        getData();
      }
    });
};

exports.update_cat_status = function (req, res) {
  categories.update(
    { _id: req.body.catId },
    { $set: { status: req.body.status } },
    null,
    function (err, doc) {
      res.send({
        error: null,
        status: 1,
        data: doc,
      });
    }
  );
};

exports.sub_category_listing_admin = function (req, res) {
  var counter = 0,
    data = [],
    dict = {};
  subcategories.find({ cat_id: req.body.cat_id }).exec(function (err, doc) {
    console.log("doc = ", doc);
    if (doc.length == 0) {
      res.send({
        error: err,
        status: 0,
        data: [],
      });
    } else {
      function getData() {
        console.log("doc[counter] = ", doc[counter]);
        console.log("[counter] = ", counter);
        categories
          .findOne({ _id: doc[counter].cat_id })
          .exec(function (err, cat) {
            dict = {
              cat_id: doc[counter].cat_id,
              created_on: doc[counter].created_on,
              follow_status: doc[counter].follow_status,
              name: doc[counter].name,
              status: doc[counter].status,
              _id: doc[counter]._id,
              category: cat == null ? "" : cat.name,
            };

            data.push(dict);
            if (counter < doc.length - 1) {
              counter = counter + 1;
              getData();
            } else {
              console.log("[else] = ", data);
              res.send({
                error: err,
                status: 1,
                data: data,
              });
            }
          });
      }

      getData();
    }

    // if(doc.length==0){
    //   res.send({
    //     error: err,
    //     status: 0,
    //     data: []
    //   });
    // }else{
    //   res.send({
    //     error: null,
    //     status: 1,
    //     data: doc
    //   });
    // }
  });
};

exports.update_sub_cat_status = function (req, res) {
  subcategories.update(
    { _id: req.body.catId },
    { $set: { status: req.body.status } },
    null,
    function (err, doc) {
      res.send({
        error: null,
        status: 1,
        data: doc,
      });
    }
  );
};
