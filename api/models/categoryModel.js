"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var schema = new Schema({
  name: {
    type: String,
  },
  status: {
    type: String,
  },
  isAll: {
    type: Boolean,
  },
  type: {
    type: String, //1 = local feed category, 2 = global feed category
  },
  follow_status: {
    // true = should be follow , 0 = should not be follow
    type: Boolean,
  },
  created_on: {
    type: Date,
  },
});

var schemacatfollow = new Schema({
  cat_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  follow_status: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

var schemasubcatfollow = new Schema({
  sub_cat_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  follow_status: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

var schemasub = new Schema({
  name: {
    type: String,
  },
  cat_id: {
    type: String,
  },
  follow_status: {
    type: Boolean,
  },
  status: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

var schemaplatform = new Schema({
  name: {
    type: String,
  },
  status: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

module.exports = mongoose.model("category", schema);
module.exports = mongoose.model("subcategory", schemasub);
module.exports = mongoose.model("platform", schemaplatform);
module.exports = mongoose.model("subcategoryfollow", schemasubcatfollow);
module.exports = mongoose.model("categoryfollow", schemacatfollow);
