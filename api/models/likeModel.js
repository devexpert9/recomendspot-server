"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var likeSchema = new Schema({
  userId: {
    type: String,
  },
  created_on: {
    type: Date,
  },
  postId: {
    type: String,
  },
});

module.exports = mongoose.model("like", likeSchema);

var Schema = mongoose.Schema;

var dislikeSchema = new Schema({
  userId: {
    type: String,
  },
  created_on: {
    type: Date,
  },
  postId: {
    type: String,
  },
});

module.exports = mongoose.model("dislike", dislikeSchema);
