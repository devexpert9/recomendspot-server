"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
  name: {
    type: String,
  },
  fcm_token: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  social_password_updated: {
    type: Boolean,
    default: false,
  },
  contact: {
    type: String,
  },
  website: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  created_on: {
    type: Date,
  },
  image: {
    type: String,
  },
  cover_image: {
    type: String,
  },
  medium: {
    type: String,
  },
  social_id: {
    type: String,
  },
  first_login: {
    type: String,
    default: "false",
  },
});

module.exports = mongoose.model("users", userSchema);
