import { classes } from "../data/classInitializer.js";
import { hasPermission } from "./middleware/index.js";
const channels = classes.Channels;
const topics = classes.Topics;

const filterByPerm = (locals, inChannel, inTopic) => {
  const canView = hasPermission("VIEW_CHANNEL")(locals, inChannel, inTopic);
  return canView;
};

class roomHandler {
  joinDMRooms = async (socket) => {
    const user = socket.data.user;
    const DMs = await channels.getUserDMs(user._id.toString(), ["_id"]);
    socket.join(DMs.map((DM) => DM._id.toString()));
  };

  joinServerRooms = async (socket, server, member) => {
    var [serverTopics, serverChannels] = await Promise.all([
      topics.getServerTopics(member.serverId, ["_id", "permissionOverwrites"]),
      channels.getServerChannels(member.serverId, [
        "_id",
        "permissionOverwrites",
      ]),
    ]);
    socket.join(member.serverId.toString());
    var locals = {};
    locals.server = server;
    locals.selfMember = member;

    const topicIds = serverTopics
      .filter((topic) => {
        locals.topic = topic;
        return filterByPerm(locals, false, true);
      })
      .map((topic) => topic._id.toString());
    const channelIds = serverChannels
      .filter((channel) => {
        locals.channel = channel;
        return filterByPerm(locals, true, false);
      })
      .map((channel) => channel._id.toString());

    socket.join(topicIds);
    socket.join(channelIds);
  };
}

export default new roomHandler();
