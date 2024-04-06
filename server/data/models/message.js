import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const messageSchema = mongoose.Schema(
  {
    content: { type: String, required: true, minLength: 1, maxLength: 2000 },
    attachmentURLs: [String],
    channelId: {
      type: mongoose.Types.ObjectId,
      ref: "Channel",
    },
    authorId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    system: { type: Boolean, default: false },
    replyingTo: {
      type: mongoose.Types.ObjectId,
      ref: "Message",
    },
    reactions: {
      type: [Object],
    },
    mentionEveryone: { type: Boolean, default: false },
    mentions: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    mentionedRoles: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Role",
      },
    ],
    type: {
      type: Number,
      min: 0,
      max: 7,
      default: 0,
    },
    pinned: Boolean,
  },
  { timestamps: true, versionKey: false }
);

messageSchema.plugin(paginate);

const Message = mongoose.model("Message", messageSchema, "messages");

export default Message;
