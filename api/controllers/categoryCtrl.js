"use strict";

var mongoose = require("mongoose"),
  multer = require("multer"),
  category = mongoose.model("category"),
  categoryfollow = mongoose.model("categoryfollow"),
  subcategoryfollow = mongoose.model("subcategoryfollow"),
  users = mongoose.model("users"),
  subcategories = mongoose.model("subcategory");
var path = require("path");
var fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "../images/");
  },
  filename: function (req, file, cb) {
    var fileExtn = file.originalname.split(".").pop(-1);
    cb(null, new Date().getTime() + "." + fileExtn);
  },
});

//****************  create_user_function ****************************
exports.add_category = function (req, res) {
  category.findOne({ name: req.body.name }, function (err, doc) {
    if (doc == null) {
      var cat = new category({
        name: req.body.name,
        isAll: req.body.isAll,
        follow_status: req.body.follow_status,
        created_on: new Date(),
        status: "1",
        type: req.body.type,
      });

      cat.save(function (err, doc) {
        if (doc == null) {
          res.send({
            error: err,
            status: 0,
            msg: "Something went wrong.Plesae try later.",
          });
        } else {
          res.send({
            data: doc,
            status: 1,
            msg: "Category added successfully!",
          });
        }
      });
    } else {
      res.send({
        error: "err",
        status: 0,
        msg: "Category alraedy exist.",
      });
    }
  });
};

exports.category_exist = function (req, res) {
  category.findOne(
    { name: req.body.name, _id: { $ne: req.body._id } },
    function (err, doc) {
      if (doc == null) {
        res.send({
          error: err,
          status: 1,
          msg: "Something went wrong.Plesae try later.",
        });
      } else {
        res.send({
          data: doc,
          status: 0,
          msg: "Category already exist!",
        });
      }
    }
  );
};

function sort(subcat_data) {
  subcat_data.sort(function (a, b) {
    return a.created_on - b.created_on;
  });
}

exports.only_category_listing = function (req, res) {
  var counter = 0,
    counter_subcat = 0,
    dict = {},
    data = [],
    subcat_dict = {},
    subcat_data = [];
  category
    // , type: req.body.type
    .find({ status: "1" }, null, {
      sort: { created_on: -1 },
    })
    .exec(function (err, doc) {
      if (doc.length == 0) {
        res.send({
          error: err,
          status: 0,
          data: [],
        });
      } else {
        res.send({
          error: null,
          status: 1,
          data: doc,
        });
      }
    });
};

exports.category_listing = function (req, res) {
  var counter = 0,
    counter_subcat = 0,
    dict = {},
    data = [],
    subcat_dict = {},
    subcat_data = [];
  category
    .find({ status: "1", type: "2" }, null, { sort: { created_on: -1 } })
    .exec(function (err, doc) {
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

      if (doc.length == 0) {
        res.send({
          error: null,
          status: 0,
          data: doc,
        });
      } else {
        function getData() {
          counter_subcat = 0;
          subcat_data = [];
          console.log("cat_id: ", doc[counter]._id);
          console.log("user_id: ", req.body.user_id);
          categoryfollow
            .findOne(
              { cat_id: doc[counter]._id, user_id: req.body.user_id },
              null,
              { sort: { created_on: -1 } }
            )
            .exec(function (err, catfollow) {
              console.log("catfollow = ", catfollow);
              subcategories
                .find({ cat_id: doc[counter]._id }, null, {
                  sort: { created_on: -1 },
                })
                .exec(function (err, subcat) {
                  if (subcat.length == 0) {
                    dict = {
                      name: doc[counter].name,
                      status: doc[counter].status,
                      type: doc[counter].type,
                      _id: doc[counter]._id,
                      follow_status: doc[counter].follow_status,
                      created_on: doc[counter].created_on,
                      sub_cat: subcat,
                      cat_follow: catfollow == null ? 0 : 1,
                    };

                    data.push(dict);
                    if (counter < doc.length - 1) {
                      counter = counter + 1;
                      getData();
                    } else {
                      res.send({
                        error: null,
                        status: 1,
                        data: data,
                      });
                    }
                  } else {
                    function getfollowsubcat() {
                      subcategoryfollow
                        .findOne(
                          {
                            sub_cat_id: subcat[counter_subcat]._id,
                            user_id: req.body.user_id,
                          },
                          null,
                          { sort: { created_on: -1 } }
                        )
                        .exec(function (err, subcatfollow) {
                          subcat_dict = {
                            cat_id: subcat[counter_subcat].cat_id,
                            created_on: subcat[counter_subcat].created_on,
                            follow_status: subcat[counter_subcat].follow_status,
                            name: subcat[counter_subcat].name,
                            status: subcat[counter_subcat].status,
                            _id: subcat[counter_subcat]._id,
                            sub_cat_follow: subcatfollow == null ? 0 : 1,
                          };
                          subcat_data.push(subcat_dict);
                          sort(subcat_data);
                          if (counter_subcat < subcat.length - 1) {
                            counter_subcat = counter_subcat + 1;
                            getfollowsubcat();
                          } else {
                            dict = {
                              name: doc[counter].name,
                              status: doc[counter].status,
                              _id: doc[counter]._id,
                              type: doc[counter].type,
                              follow_status: doc[counter].follow_status,
                              created_on: doc[counter].created_on,
                              sub_cat: subcat_data,
                              cat_follow: catfollow == null ? 0 : 1,
                            };

                            data.push(dict);
                            if (counter < doc.length - 1) {
                              counter = counter + 1;
                              getData();
                            } else {
                              res.send({
                                error: null,
                                status: 1,
                                data: data,
                              });
                            }
                          }
                        });
                    }
                    getfollowsubcat();
                  }

                  // subcategoryfollow.findOne({sub_cat_id: subcat._id}, null, {sort: {'created_on': -1}}).exec(function(err, subcatfollow) {

                  //   dict = {
                  //     name: doc[counter].name,
                  //     status: doc[counter].status,
                  //     _id: doc[counter]._id,
                  //     follow_status: doc[counter].follow_status,
                  //     created_on: doc[counter].created_on,
                  //     sub_cat: subcat,
                  //     cat_follow: catfollow == null ? 0 : 1,
                  //     sub_cat_follow: subcatfollow == null ? 0 : 1,

                  //   }

                  //   data.push(dict);
                  //   if(counter < doc.length - 1){
                  //     counter = counter + 1;
                  //     getData();
                  //   }else{
                  //     res.send({
                  //       error: null,
                  //       status: 1,
                  //       data: data
                  //     });
                  //   }
                  // });
                });
            });
        }
        getData();
      }
    });
};

exports.delete_category = function (req, res) {
  category.remove({ _id: req.body._id }, function (err, doc) {
    // fs.unlinkSync('/home/bitnami/images/' + req.body.image, function (err) {
    // });

    res.send({
      error: null,
      status: 1,
      msg: "Category deleted successfully.",
    });
  });
};

exports.update_category = function (req, res) {
  category.findOne(
    { name: req.body.name, _id: { $ne: req.body._id } },
    function (err, doc) {
      if (doc != null) {
        res.send({
          error: err,
          status: 0,
          msg: "Category already exist.",
        });
      } else {
        category.update(
          { _id: req.body._id },
          {
            $set: {
              name: req.body.name,
              isAll: req.body.isAll,
              follow_status: req.body.follow_status,
            },
          },
          { new: true },
          function (err, doc) {
            if (doc == null) {
              res.send({
                status: 0,
                data: null,
                msg: "Something went wrong.Plesae try later.",
              });
            } else {
              res.json({
                status: 1,
                data: doc,
                msg: "Category updated successfully.",
              });
            }
          }
        );
      }
    }
  );
};

exports.get_category = function (req, res) {
  category.findOne({ _id: req.body._id }, function (err, doc) {
    if (doc == null) {
      res.send({
        error: err,
        status: 1,
        msg: "Something went wrong.Plesae try later.",
      });
    } else {
      res.send({
        data: doc,
        status: 0,
        msg: "Category details",
      });
    }
  });
};

exports.follow_unfollow_category = function (req, res) {
  if (req.body.follow_status == "1") {
    var new_user = new categoryfollow({
      user_id: req.body.user_id,
      cat_id: req.body.cat_id,
      follow_status: req.body.follow_status,
      created_on: new Date(),
    });

    new_user.save(function (err, user) {
      users.update(
        { _id: req.body.user_id },
        { $set: { first_login: "true" } },
        { new: true },
        function (err, save) {}
      );

      res.send({
        data: user,
        status: 1,
        error: "Followed successfully!",
      });
    });
  } else if (req.body.follow_status == "0") {
    categoryfollow.remove(
      { user_id: req.body.user_id, cat_id: req.body.cat_id },
      function (err, doc) {
        res.send({
          data: doc,
          status: 1,
          error: "Unfollow successfully!",
        });
      }
    );
  }
};

//demo code
exports.send_query_email = function (req, res) {
  console.log(req.body);
  var string = "Cusromer Query";
  var fs = require("fs"); // npm install fs
  var readStream = fs.createReadStream(
    path.join(__dirname, "../templates") + "/query.html",
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
        "ramanindiit@gmail.com",
        "Customer Support Desk"
      );
      var toEmail = new helper.Email("kunalindiit@gmail.com");
      //var toEmail = new helper.Email('gurmukhindiit@gmail.com');
      var subject = "Support Request";

      dynamic_data = dynamic_data.replace("#STRING#", string);
      dynamic_data = dynamic_data.replace(
        "#NAME#",
        req.body.firstname + " " + req.body.lastname
      );
      dynamic_data = dynamic_data.replace(
        "#NAME1#",
        req.body.firstname + " " + req.body.lastname
      );
      dynamic_data = dynamic_data.replace("#EMAIL#", req.body.email);
      dynamic_data = dynamic_data.replace("#CONTACT#", req.body.contact);
      dynamic_data = dynamic_data.replace("#QUERY#", req.body.query);
      var content = new helper.Content("text/html", dynamic_data);

      var mail = new helper.Mail(fromEmail, subject, toEmail, content);
      // var sg = require('sendgrid')(constants.SENDGRID_API_ID);
      var sg = require("sendgrid")(
        "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"
      );
      // var sg = require('sendgrid')('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');
      var request = sg.emptyRequest({
        method: "POST",
        path: "/v3/mail/send",
        body: mail.toJSON(),
      });
      sg.API(request, function (error, response) {
        if (error) {
          console.log(error);
          res.json({
            msg: "Something went wrong.Please try later.",
            status: 0,
            error: error,
          });
          // console.log('Error response received');
        } else {
          res.json({
            msg: "Mail has been sent successfully",
            status: 1,
            data: null,
          });
        }
      });
    });
};
