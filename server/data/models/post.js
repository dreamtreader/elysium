import mongoose from "mongoose";

const postSchema = mongoose.Schema(
  {
    title: {
      type: String,
      minLength: 2,
      maxLength: 100,
    },
    content: {
      type: String,
    },
    description: {
      type: String,
    },
    banner: {
      type: String,
    },
    tags: [
      {
        type: String,
      },
    ],
    attachments: [{ type: String }],
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serverId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
    topicId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    likes: {
      default: 0,
      type: Number,
      min: 0,
    },
    views: {
      default: 0,
      type: Number,
      min: 0,
    },
  },
  { versionKey: false }
);

const Post = mongoose.model("Post", postSchema, "posts");

export default Post;
