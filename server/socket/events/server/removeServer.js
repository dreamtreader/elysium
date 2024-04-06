import { updateServer } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { removeImagesByTag } from "../../../cloudinary/removeImages.js";

import bcrypt from "bcrypt";

const servers = classes.Servers;
const channels = classes.Channels;
const topics = classes.Topics;

export class removeServer {
  name = "serverRemoved";

  trigger = async (io, socket, payload) => {
    const { password } = payload;
    const locals = {};
    locals.user = socket.data.user;
    locals.server = await updateServer(payload, false);

    if (!bcrypt.compare(password, locals.user.password))
      throw Error("Password is not valid");

    if (user._id.toString() !== locals.server.ownerId.toString())
      throw Error("You are not allowed to delete a server you don't own");

    var [channelIds, topicIds] = await Promise.all([
      channels.getServerChannels(locals.server._id.toString(), ["_id"]),
      topics.getServerTopics(locals.server._id.toString(), ["_id"]),
    ]);

    channelIds = channelIds.map((channel) => channel._id.toString());
    topicIds = topicIds.map((topic) => topic._id.toString());

    await Promise.all([
      locals.server.deleteOne(),
      servers.delete(locals.server._id.toString(), channelIds, topicIds),
    ]);

    removeImagesByTag(locals.server._id.toString());
    io.to(locals.server._id.toString()).emit(
      this.name,
      locals.server._id.toString()
    );

    io.in(locals.server._id.toString()).socketsLeave(channelIds);
    io.in(locals.server._id.toString()).socketsLeave(topicIds);
    io.in(locals.server._id.toString()).socketsLeave(
      locals.server._id.toString()
    );
  };
}
