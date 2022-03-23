"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var commentSchema = new Schema({
  userId: {
    type: String,
  },
  postId: {
    type: String,
  },
  comment: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

module.exports = mongoose.model("comment", commentSchema);
