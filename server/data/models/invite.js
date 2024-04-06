import mongoose from "mongoose";

const inviteSchema = mongoose.Schema(
  {
    expiresAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
      default: new Date(),
    },
    maxUses: {
      type: Number,
      min: 1,
      max: 1000,
    },
    uses: {
      type: Number,
      default: 0,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
  },
  { versionKey: false }
);

const Invite = mongoose.model("Invite", inviteSchema, "invites");

export default Invite;
