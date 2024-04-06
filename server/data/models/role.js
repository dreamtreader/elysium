import mongoose from "mongoose";
import { defaultPermissions } from "../../types/index.js";

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      maxLength: 32,
      default: "New Role",
    },
    color: {
      type: String,
      default: "#FFFFFF",
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: new Date(),
    },
    hoisted: {
      type: Boolean,
      default: false,
    },
    mentionable: { type: Boolean, default: false },
    position: {
      type: Number,
      required: true,
      min: 0,
      max: [255, "You've reached the highest position for roles"],
    },
    permissions: {
      type: Number,
      default: defaultPermissions,
    },
  },
  { versionKey: false }
);

const Role = mongoose.model("Role", roleSchema, "roles");

export default Role;
