"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var staffSchema = new Schema({
  userId: {
    type: String,
  },
  friendId: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

module.exports = mongoose.model("friends", staffSchema);
