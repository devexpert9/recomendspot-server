"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FriendsRecommendations = new Schema({
  fromId: {
    type: String,
  },
  toId: {
    type: Array,
  },
  postId: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

module.exports = mongoose.model(
  "friendsrecommendations",
  FriendsRecommendations
);
