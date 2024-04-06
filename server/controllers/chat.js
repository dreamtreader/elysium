import {
  Member,
  Channel,
  Role,
  User,
  Topic,
  Message,
} from "../data/models/index.js";
import { hasPermission } from "../socket/middleware/hasPermission.js";
import { CHANNEL_IDS } from "../types/index.js";
import { classes } from "../data/classInitializer.js";

const Users = classes.Users;

export const getChatData = async (req, res) => {
  const user = res.locals.user;
  const userId = user._id.toString();

  if (!userId) return res.status(400).json({ message: "User not found" });
  try {
    const members = await Member.find({ userId: userId })
      .populate("serverId")
      .lean()
      .exec();

    const users = new Set();
    const channels = [];
    const roles = [];
    const topics = [];
    var pings = {
      DMs: {},
      servers: {},
    };

    const DMs = await Channel.find({
      type: { $in: [CHANNEL_IDS.DM, CHANNEL_IDS.GROUP_DM] },
      recipients: user._id.toString(),
    });

    channels.push(...DMs);

    for (const friendRequest of user.friendRequests) {
      if (friendRequest.transmitter !== user._id.toString()) {
        const user = await Users.getSafely(friendRequest.transmitter);
        users.add(user);
      } else {
        const user = await Users.getSafely(friendRequest.receiver);
        users.add(user);
      }
    }
    for (const friend of user.friends) {
      const user = await Users.getSafely(friend);
      users.add(user);
    }
    for (const DM of DMs) {
      for (const recipient of DM.recipients) {
        if (recipient !== user._id) {
          const user = await Users.getSafely(recipient);
          users.add(user);
        }
      }
      const lastReadMessage =
        user.lastReadMessageIds?.[DM._id.toString()]?.toString();

      const messages = await Message.find({
        type: 1,
        channelId: DM._id.toString(),
        ...(lastReadMessage && { _id: { $gt: lastReadMessage } }),
        authorId: { $ne: user._id },
      })
        .select("_id")
        .sort({ date: -1 })
        .limit(100);

      pings.DMs[DM._id.toString()] = messages.map((message) => message._id);
    }
    for (const member of members) {
      const locals = {
        selfMember: member,
        server: member.serverId,
      };

      var [serverChannels, serverTopics, serverRoles] = await Promise.all([
        Channel.find({
          serverId: member.serverId._id.toString(),
        })
          .lean()
          .exec(),
        Topic.find({
          serverId: member.serverId._id.toString(),
        })
          .lean()
          .exec(),
        Role.find({ serverId: member.serverId._id.toString() }).lean().exec(),
      ]);

      serverChannels = serverChannels.filter((channel) => {
        locals.channel = channel;
        return hasPermission("VIEW_CHANNEL")(locals, true, false);
      });

      serverTopics = serverTopics.filter((topic) => {
        locals.topic = topic;
        return hasPermission("VIEW_CHANNEL")(locals, false, true);
      });

      for (const channel of serverChannels) {
        const lastReadMessage =
          user.lastReadMessageIds?.[channel._id.toString()]?.toString();

        const messages = await Message.find({
          channelId: channel._id.toString(),
          $or: [
            { mentions: user._id.toString() },
            { mentionedRoles: { $in: member.roleIds } },
          ],
          ...(lastReadMessage && { _id: { $gt: lastReadMessage } }),
          authorId: { $ne: user._id },
        })
          .select("_id")
          .sort({ date: -1 })
          .limit(100);

        console.log(messages);
        if (!pings.servers[channel.serverId.toString()])
          pings.servers[channel.serverId.toString()] = {};

        pings.servers[channel.serverId.toString()][channel._id.toString()] =
          messages.map((message) => message._id.toString());
      }

      topics.push(...serverTopics);
      channels.push(...serverChannels);
      roles.push(...serverRoles);
    }

    res.status(200).json({
      channels: channels,
      members: members,
      roles: roles,
      users: [...Array.from(users), user],
      topics: topics,
      pings: pings,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: err });
  }
};
