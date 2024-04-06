import mongoose from "mongoose";

const profileSchema = mongoose.Schema(
  {
    content: {
      type: String,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
    },
  },
  { versionKey: false }
);

const Profile = mongoose.model("Profile", profileSchema, "profiles");
export default Profile;
