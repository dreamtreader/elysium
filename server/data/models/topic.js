import mongoose from "mongoose";

const topicSchema = mongoose.Schema(
  {
    name: { required: true, type: String, minLength: 1, maxLength: 32 },
    avatar: { type: String },
    iconId: { type: Number },
    color: { type: String },
    serverId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "servers",
    },
    permissionOverwrites: {
      type: [Object],
      default: [],
    },
    position: {
      type: Number,
      required: true,
      min: 0,
      max: [9, "You cannot have more than 10 topics in a server"],
    },
  },
  { versionKey: false }
);

const Topic = mongoose.model("Topic", topicSchema, "topics");

export default Topic;
