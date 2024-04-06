import {
  updateTopic,
  updateSelfMember,
  hasPermission,
} from "../../middleware/index.js";

import { classes } from "../../../data/classInitializer.js";
import { removeImagesByTag } from "../../../cloudinary/removeImages.js";
const topics = classes.Topics;
const channels = classes.Channels;
export class removeTopic {
  name = "topicRemoved";
  trigger = async (io, socket, payload) => {
    const { topicId } = payload;
    const locals = {};
    locals.user = socket.data.user;
    locals.selfMember = socket.data.members[payload.serverId];
    locals.topic = await updateTopic(payload);

    const hasPerm = hasPermission("MANAGE_CHANNEL")(locals);
    const canView = hasPermission("VIEW_CHANNEL")(locals, false, true);
    if (!hasPerm || !canView) return;

    const topicChannelIds = await channels.getTopicChannels(
      topicId,
      ["_id"],
      true
    );

    removeImagesByTag(topicId);

    await topics.remove(topicId);

    io.in(topicId).socketsLeave(topicId);
    io.in(topicChannelIds).socketsLeave(topicChannelIds);
  };
}
