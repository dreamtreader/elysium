import {
  updateSelfMember,
  updateChannel,
  updateServer,
  hasPermission,
} from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";

const channels = classes.Channels;

export class removeChannel {
  name = "channelRemoved";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.channel = await updateChannel(payload, false);
    locals.selfMember = socket.data.members[payload.serverId];

    const canView = hasPermission("VIEW_CHANNEL")(locals, true);
    const hasPerm = hasPermission("MANAGE_CHANNEL")(locals);

    if (!hasPerm || !canView) return;

    await channels.delete(locals.channel);

    console.log(locals.channel);
    io.to(locals.channel._id.toString()).emit(this.name, {
      channelId: locals.channel._id.toString(),
      authorId: locals.user._id.toString(),
    });
    io.in(locals.channel._id.toString()).socketsLeave(
      locals.channel._id.toString()
    );
  };
}
