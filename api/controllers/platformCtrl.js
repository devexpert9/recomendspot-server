"use strict";

var mongoose = require("mongoose"),
  multer = require("multer"),
  category = mongoose.model("category"),
  platforms = mongoose.model("platform"),
  users = mongoose.model("users"),
  subcategories = mongoose.model("subcategory");
var path = require("path");
var fs = require("fs");

//**************sub category module *******************
exports.add_platform = function (req, res) {
  var doc = new platforms({
    name: req.body.name,
    created_on: new Date(),
    status: "1",
  });

  doc.save(function (err, doc) {
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
        msg: "Platform added successfully!",
      });
    }
  });
};

exports.platform_listing = function (req, res) {
  platforms
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
