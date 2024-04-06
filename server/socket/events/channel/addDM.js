import { classes } from "../../../data/classInitializer.js";
import { CHANNEL_IDS } from "../../../types/index.js";
import User from "../../../data/models/user.js";
import Channel from "../../../data/models/channel.js";
const channels = classes.Channels;

export class addDM {
  name = "DMAdded";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { userId } = payload;

    if (!userId) throw Error("User ID was not provided");
    if (userId === locals.user._id.toString())
      throw Error("You can't create a direct message with yourself");
    const user = await User.exists({ _id: userId });
    if (!user) throw Error("User is not valid");

    const DM = await Channel.findOne({
      type: CHANNEL_IDS.DM,
      recipients: [locals.user._id.toString(), userId],
    });

    if (DM) {
      socket.emit("channelAdded", DM);
      io.in(userId).emit("channelAdded", DM);
      return;
    }

    const channel = await channels.createDM({
      type: CHANNEL_IDS.DM,
      recipients: [locals.user._id.toString(), userId],
    });

    socket.join(channel._id.toString());

    const sockets = await io.in(userId).fetchSockets();
    const DMRecipient = sockets.find(
      (socket) => socket.data.user._id.toString() === userId
    );
    if (DMRecipient) DMRecipient.join(channel._id.toString());

    io.in(channel._id.toString()).emit("channelAdded", channel);
  };
}
