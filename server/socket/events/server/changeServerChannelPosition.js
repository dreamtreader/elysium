import {
  updateServer,
  updateChannel,
  updateTopic,
} from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { hasPermission } from "../../middleware/hasPermission.js";

const channels = classes.Channels;

export class changeServerChannelPosition {
  name = "serverChannelPositionChanged";

  trigger = async (io, socket, payload) => {
    const { oldIndex, newIndex } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.topic = await updateTopic(payload);
    locals.channel = await channels.getByPosition(
      oldIndex,
      locals.topic._id,
      false
    );
    locals.hasPerm = hasPermission("MANAGE_CHANNEL")(locals, true);

    if (!locals.hasPerm) return;

    if (oldIndex === undefined || newIndex === undefined)
      throw Error(
        "You must provide both the old and the new index of the channel"
      );

    const channelToSwap = await channels.getByPosition(
      newIndex,
      locals.topic._id,
      false
    );

    channelToSwap.position = oldIndex;
    locals.channel.position = newIndex;

    await Promise.all([channelToSwap.save(), locals.channel.save()]);

    io.to(locals.channel._id.toString()).emit(this.name, [
      { _id: locals.channel._id.toString(), position: newIndex },
      { _id: channelToSwap._id.toString(), position: oldIndex },
    ]);
  };
}
