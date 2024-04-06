import { updateServer, updateTopic } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { updateUser } from "../../middleware/updateUser.js";
import { hasPermission } from "../../middleware/hasPermission.js";

const channels = classes.Channels;
export class addServerChannel {
  name = "serverChannelAdded";

  trigger = async (io, socket, payload) => {
    const { serverId, topicId, name } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.selfMember = socket.data.members[serverId];

    locals.server = await updateServer(payload);
    locals.topic = await updateTopic(payload);
    locals.hasPerm = hasPermission("MANAGE_CHANNEL")(locals, false, true);

    if (!locals.hasPerm) return;

    const channel = await channels.create({
      ...(name && { name: name }),
      type: 0,
      serverId: serverId,
      topicId: topicId,
    });

    const sockets = await io.in(channel.topicId.toString()).fetchSockets();

    sockets.forEach(async (socket) => {
      locals.user = socket.data.user;
      locals.selfMember = socket.data.members[serverId];
      const hasPermTopic = hasPermission("VIEW_CHANNEL")(locals, false, true);
      console.log(socket.data.user.username);
      console.log(hasPermTopic);
      if (hasPermTopic) {
        socket.join(channel._id.toString());
        socket.emit("channelAdded", {
          ...channel._doc,
          authorId: locals.user._id.toString(),
        });
      }
    });
  };
}
