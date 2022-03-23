"use strict";

var mongoose = require("mongoose"),
  multer = require("multer"),
  category = mongoose.model("category"),
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

//**************sub category module *******************
exports.add_sub_category = function (req, res) {
  // subcategories.findOne({}, function(err, doc) {
  // if(doc == null){
  var cat = new subcategories({
    name: req.body.name,
    cat_id: req.body.cat_id,
    follow_status: req.body.follow_status,
    created_on: new Date(),
    status: "1",
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
        msg: "Sub category added successfully!",
      });
    }
  });
  //   }else{
  //     res.send({
  //       error: 'err',
  //       status: 0,
  //       msg: 'Sub category alraedy exist.'
  //     });
  //   }
  // });
};

exports.sub_category_exist = function (req, res) {
  subcategories.findOne(
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
          msg: "Sub category already exist!",
        });
      }
    }
  );
};

exports.sub_category_listing = function (req, res) {
  subcategories
    .find({ status: "1" }, null, { sort: { created_on: -1 } })
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
exports.delete_sub_category = function (req, res) {
  subcategories.remove({ _id: req.body._id }, function (err, doc) {
    // fs.unlinkSync('/home/bitnami/images/' + req.body.image, function (err) {
    // });

    res.send({
      error: null,
      status: 1,
      msg: "Sub category deleted successfully.",
    });
  });
};

exports.update_sub_category = function (req, res) {
  // subcategories.findOne({ name: req.body.name , '_id' :{ $ne: req.body._id } }, function(err, doc) {
  //  if(doc != null){
  //     res.send({
  //       error: err,
  //       status: 0,
  //       msg:'Sub category already exist.'
  //     });
  //   }else{
  //     subcategories.update({ '_id': req.body._id }, { $set: { 'name': req.body.name,follow_status: req.body.follow_status,} }, {new: true}, function(err, doc) {
  //       if(doc == null){
  //         res.send({
  //           status: 0,
  //           data: null,
  //           msg:'Something went wrong.Plesae try later.'
  //         });

  //       }else{
  //         res.json({
  //            status: 1,
  //            data: doc,
  //            msg:'Sub category updated successfully.'
  //         });

  //       }
  //     });
  //   }
  // });
  subcategories.update(
    { _id: req.body._id },
    { $set: { name: req.body.name, follow_status: req.body.follow_status } },
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
          msg: "Sub category updated successfully.",
        });
      }
    }
  );
};

exports.get_sub_category = function (req, res) {
  subcategories.findOne({ _id: req.body._id }, function (err, doc) {
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
        msg: "Sub category details",
      });
    }
  });
};

exports.follow_unfollow_sub_category = function (req, res) {
  if (req.body.follow_status == "1") {
    var new_user = new subcategoryfollow({
      user_id: req.body.user_id,
      sub_cat_id: req.body.sub_cat_id,
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
    subcategoryfollow.remove(
      { user_id: req.body.user_id, sub_cat_id: req.body.sub_cat_id },
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
