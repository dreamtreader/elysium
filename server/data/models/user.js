import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validators from "../validators.js";

const userSchema = mongoose.Schema(
  {
    displayName: { type: String, minLength: 1, maxLength: 32, required: true },
    username: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 32,
      unique: true,
      validate: [
        validators.username,
        "Username must not contain any terms related to Elysium, here, everyone or any special characters",
      ],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      uniqueCaseInsensitive: true,
    },
    password: { type: String, required: true, minLength: 2 },
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
    friendRequests: [
      {
        transmitter: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    lastReadMessageIds: {
      type: Object,
      default: {},
    },
    status: { type: String, maxLength: 128, minLength: 1 },
    isOnline: { type: Boolean, default: false },
    verified: Boolean,
    createdAt: {
      type: Date,
      default: new Date(),
    },
    ignored: {
      type: Object,
      default: { channelIds: [], guildIds: [], userIds: [] },
      validate: {
        validator: function (doc, value) {
          return !value || !value.userIds?.includes(doc.id);
        },
        message: "Cannot block self",
      },
      channelIds: { type: [String], default: [] },
      serverIds: { type: [String], default: [] },
      userIds: { type: [String], default: [] },
    },
    premium: Boolean,
    premiumExpiresAt: Date,
  },
  { versionKey: false }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("username")) return next();
  this.username = this.username.replaceAll(/\s/g, "");
  return next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  const hash = bcrypt.hashSync(this.password, 8);
  this.password = hash;
  return next();
});

userSchema.methods.checkPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("User", userSchema, "users");

export default User;
