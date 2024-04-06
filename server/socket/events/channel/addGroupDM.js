import { classes } from "../../../data/classInitializer.js";
import { CHANNEL_IDS } from "../../../types/index.js";
import User from "../../../data/models/user.js";
import Channel from "../../../data/models/channel.js";
const channels = classes.Channels;

export class addGroupDM {
  name = "groupDMAdded";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { userIds } = payload;

    if (!userIds || !userIds.length)
      throw Error("Participant IDs were not provided");
    if (userIds.includes(locals.user._id.toString()))
      throw Error("You must only include participants besides yourself");
    if (userIds.length > 9)
      throw Error("Group DMs must not have more than 10 participants");

    const friendCount = await User.countDocuments({ _id: { $in: userIds } });

    if (friendCount !== userIds.length)
      throw Error("Some user IDs provided may be invalid");

    const DM = await Channel.findOne({
      type: CHANNEL_IDS.GROUP_DM,
      recipients: [locals.user._id.toString(), ...userIds],
    });

    if (DM) {
      socket.emit("channelAdded", DM);
      for (const userId in userIds) {
        io.in(userId).emit("channelAdded", DM);
      }
      return;
    }

    const channel = await channels.createDM({
      type: CHANNEL_IDS.GROUP_DM,
      ownerId: locals.user._id.toString(),
      recipients: [locals.user._id.toString(), ...userIds],
    });

    socket.join(channel._id.toString());

    const sockets = await io.in(locals.user._id.toString()).fetchSockets();
    const DMRecipients = sockets.filter((socket) =>
      userIds.includes(socket.data.user._id.toString())
    );
    for (const DMRecipient of DMRecipients) {
      DMRecipient.join(channel._id.toString());
    }

    io.in(channel._id.toString()).emit("channelAdded", channel);
  };
}
