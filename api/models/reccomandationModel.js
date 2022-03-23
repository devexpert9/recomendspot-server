"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var reccSchema = new Schema({
  type: {
    type: String,
  },
  title: {
    type: String,
  },
  category: {
    type: String,
  },
  platform: {
    type: String,
  },
  sub_category: {
    type: String,
  },
  description: {
    type: String,
  },
  web_link: {
    type: String,
  },
  user_id: {
    type: String,
  },
  formatted_date: {
    type: String,
  },
  like: {
    type: String,
  },
  comment: {
    type: String,
  },
  image: {
    type: String,
  },
  add_user_type: {
    type: String,
  },
  tags: {
    type: Array,
  },
  comment_count: {
    type: String,
  },
  like_count: {
    type: String,
  },
  web_link_content: {
    type: Schema.Types.Mixed,
  },
  created_at: {
    type: Date,
  },
  location: {
    type: String,
  },
  lat: {
    type: Number,
  },
  long: {
    type: Number,
  },
  cords: {
    type: { type: String },
    coordinates: [Number],
  },
  recc_type: {
    type: String,
  },
  recc_contact: {
    type: String,
  },
});

var favSchema = new Schema({
  recc_id: {
    type: String,
  },
  user_id: {
    type: String,
  },
  created_at: {
    type: Date,
  },
});

module.exports = mongoose.model("reccomandations", reccSchema);
module.exports = mongoose.model("favourites", favSchema);
