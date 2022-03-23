"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var chatSchema = new Schema({
  senderId: {
    type: String,
  },
  text: {
    type: String,
  },
  receiverId: {
    type: String,
  },
  isMedia: {
    type: Boolean,
  },
  media: {
    type: String,
  },
  receiverStatus: {
    type: Number,
  },
  senderStatus: {
    type: Number,
  },
  seen: {
    type: Number,
  },
  created_on: {
    type: Date,
  },
  chatId: {
    type: String,
  },
});

var chatListing = new Schema({
  senderId: {
    type: String,
  },
  receiverId: {
    type: String,
  },
  created_on: {
    type: Date,
  },
});

var notificationSchema = new Schema({
  senderId: {
    type: String,
  },
  receiverId: {
    type: Schema.Types.Mixed,
  },
  created_on: {
    type: Date,
  },
  noti_type: {
    type: String,
  },
  itemId: {
    type: String,
  },
  read: {
    type: Number,
  },
});

var recc_notificationSchema = new Schema({
  senderId: {
    type: String,
  },
  receiverId: {
    type: Array,
  },
  created_on: {
    type: Date,
  },
  itemId: {
    type: String,
  },
  read: {
    type: Number,
  },
});

module.exports = mongoose.model("chatlisting", chatListing);
module.exports = mongoose.model("chat", chatSchema);
module.exports = mongoose.model("notification", notificationSchema);
module.exports = mongoose.model("reccnotification", recc_notificationSchema);
