import mongoose from "mongoose";

const serverSchema = mongoose.Schema(
  {
    name: { type: String, minLength: 2, maxLength: 100 },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    avatar: { type: String },
    banner: { type: String },
    emojis: { type: [String], default: [] },
    createdAt: {
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false }
);

const Server = mongoose.model("Server", serverSchema, "servers");
export default Server;
