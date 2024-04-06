import mongoose from "mongoose";
import validators from "./../validators.js";

const channelSchema = mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 1,
      maxLength: 100,
      required: function () {
        return this.type === 0;
      },
      validate: {
        validator: validators.channelName,
        message: "Channel name is not valid.",
      },
    },
    type: { type: Number, default: 0, min: 0, max: 4 },
    position: {
      type: Number,
      required: function (val) {
        return this.type === 0;
      },
      min: 0,
      max: [49, "You cannot have more than 50 channels in a category"],
    },
    permissionOverwrites: {
      type: [Object],
      required: function (val) {
        return this.type === 0;
      },
    },
    avatar: { type: String },
    recipients: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      min: 2,
      max: 10,
      required: function (val) {
        return this.type === 3 || this.type === 1;
      },
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function (val) {
        return this.type === 3;
      },
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    description: { type: String },
    serverId: {
      required: function () {
        return this.type === 0;
      },
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
    topicId: {
      function() {
        return this.type === 0;
      },
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
  },
  { versionKey: false }
);

const Channel = mongoose.model("Channel", channelSchema, "channels");

export default Channel;
