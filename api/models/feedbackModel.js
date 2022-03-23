"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var FeedbackScema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  message: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

module.exports = mongoose.model("feedback", FeedbackScema);
