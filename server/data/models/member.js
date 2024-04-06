import mongoose from "mongoose";

const memberSchema = mongoose.Schema(
  {
    userId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    displayName: { type: String, minLength: 2, maxLength: 32 },
    serverId: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
    roleIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    avatar: {
      type: String,
    },
    banner: {
      type: String,
    },
    primaryColor: {
      type: String,
    },
    secondaryColor: {
      type: String,
    },
    joinedAt: {
      required: true,
      type: Date,
      default: new Date(),
    },
  },
  { versionKey: false }
);

const Member = mongoose.model("Member", memberSchema, "members");

export default Member;
