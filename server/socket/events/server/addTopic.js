import { updateServer } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { hasPermission } from "../../middleware/hasPermission.js";

const topics = classes.Topics;
export class addTopic {
  name = "topicAdded";

  trigger = async (io, socket, payload) => {
    const { serverId, name } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[payload.serverId];
    locals.hasPerm = hasPermission("MANAGE_CHANNEL")(locals);

    if (!locals.hasPerm) return;

    const topic = await topics.create({
      ...(name && { name: name }),
      serverId: serverId,
    });

    io.in(topic.serverId.toString()).socketsJoin(topic._id.toString());
    io.to(topic.serverId.toString()).emit(this.name, topic);
  };
}
