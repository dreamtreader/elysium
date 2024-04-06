import { classes } from "../../../data/classInitializer.js";
import { CHANNEL_IDS } from "../../../types/index.js";
import {
  hasPermission,
  updateChannel,
  updateRole,
  updateServer,
  updateTopic,
} from "../../middleware/index.js";
import cloudinary from "cloudinary";

import Member from "../../../data/models/member.js";
import User from "../../../data/models/user.js";

const messages = classes.Messages;

export class addMessage {
  name = "messageAdded";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    locals.channel = await updateChannel(payload, false);

    const { mentions, mentionedRoles } = payload;

    if (locals.channel.type === CHANNEL_IDS.TEXT) {
      locals.server = await updateServer(payload);
      locals.topic = await updateTopic({
        topicId: locals.channel.topicId.toString(),
      });
      locals.selfMember = socket.data.members[locals.server._id.toString()];

      const hasPerm = hasPermission("SEND_MESSAGE")(locals, true);
      if (!hasPerm) return;

      if (mentions) {
        for (const mention of mentions) {
          locals.member = await User.exists({ _id: mention });
          if (!locals.member)
            throw Error("You are trying to mention members that do not exist");
        }
      }
      if (mentionedRoles) {
        for (const mention of mentionedRoles) {
          payload.roleId = mention;
          locals.role = await updateRole(payload);
          if (!role.canBeMentioned)
            throw Error(
              "You are trying to mention roles that cannot be mentioned"
            );
        }
      }
    } else {
      if (mentions) {
        for (const mention of mentions) {
          locals.user = await User.exists({ _id: mention });
          if (!locals.user)
            throw Error("You are trying to mention users that do not exist");
        }
      }
    }

    const attachments = payload.attachments ?? [];
    if (attachments.length > 10) {
      throw Error("A message may not have more than 10 attachments.");
    }

    const message = await messages.create({
      ...payload,
      authorId: locals.user._id.toString(),
    });

    const attachmentPromises = [];
    for (const attachment of attachments) {
      attachmentPromises.push(
        cloudinary.v2.uploader.upload(attachment, {
          upload_preset: "elysium",
          folder: `media/messages/${message._id.toString()}`,
          tags:
            locals.channel.type === CHANNEL_IDS.TEXT
              ? `${locals.channel._id.toString()}, ${locals.topic._id.toString()}, ${locals.server._id.toString()}, ${message._id.toString()}, ${locals.user._id.toString()}`
              : `${locals.channel._id.toString()}, ${message._id.toString()}, ${locals.user._id.toString()}`,
        })
      );
    }

    if (attachments.length)
      await Promise.all(attachmentPromises).then(async (results) => {
        message.attachmentURLs = results.map((result) => result.secure_url);
        await message.save();
        locals.channel.set({ lastMessageId: message._id });
        await locals.channel.save();
        io.to(message.channelId.toString()).emit(this.name, message);
        io.to(message.channelId.toString()).emit(
          "channelChanged",
          locals.channel
        );
      });
    else {
      locals.channel.set({ lastMessageId: message._id });
      await locals.channel.save();
      io.to(message.channelId.toString()).emit(this.name, message);
      io.to(message.channelId.toString()).emit(
        "channelChanged",
        locals.channel
      );
    }
  };
}
