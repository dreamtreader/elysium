import { Server } from "socket.io";
import socketEvents from "./events/index.js";
import { updateUser } from "./middleware/index.js";
import { classes } from "../data/classInitializer.js";
import { hasPermission } from "./middleware/index.js";
import handleRooms from "./handleRooms.js";

const members = classes.Members;
const topics = classes.Topics;
const channels = classes.Channels;
const servers = classes.Servers;

export class SocketHandler {
  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: "http://localhost:5173",
        credentials: true,
      },
    });

    this.io.use(async (socket, next) => {
      if (!socket.data.user) {
        socket.data.user = await updateUser(socket, false, next);
        socket.join(socket.data.user._id.toString());
      }
      next();
    });
    this.io.use(async (socket, next) => {
      handleRooms.joinDMRooms(socket);
      if (!socket.data.members) {
        const selfMembers = await members.getMultipleByUserId(
          socket.data.user._id.toString(),
          [],
          false
        );
        socket.data.members = selfMembers.reduce((a, v) => {
          return { ...a, [v.serverId.toString()]: v };
        }, {});
        const memberIds = selfMembers.map((member) => member.serverId);
        var userServers = await servers.getMultipleById(memberIds, [
          "ownerId",
          "_id",
        ]);

        userServers = userServers.reduce((a, v) => {
          return { ...a, [v._id]: v };
        }, {});

        for (const member of selfMembers) {
          const server = userServers[member.serverId];
          handleRooms.joinServerRooms(socket, server, member);

          console.log(socket.rooms);
          /**var [serverTopics, serverChannels] = await Promise.all([
            topics.getServerTopics(member.serverId, [
              "_id",
              "permissionOverwrites",
            ]),
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
              return filterByPerm(locals, "topic", topic, false, true);
            })
            .map((topic) => topic._id.toString());
          const channelIds = serverChannels
            .filter((channel) => {
              locals.channel = channel;
              return filterByPerm(locals, "channel", channel, true, false);
            })
            .map((channel) => channel._id.toString());

          socket.join(topicIds);
          socket.join(channelIds); **/
        }
      }
      next();
    });

    this.io.on("connection", (socket) => {
      socket.on("disconnect", async () => {
        socket.data.user.isOnline = false;
        await socket.data.user.save();
        this.io.in(socket.data.user._id.toString()).emit("userChanged", {
          _id: socket.data.user._id.toString(),
          isOnline: false,
        });
      });
      for (const event of Object.values(socketEvents)) {
        socket.on(event.name, async (payload) => {
          try {
            await event.trigger(this.io, socket, payload);
          } catch (err) {
            console.log(err);
            socket.emit("error", { message: err.message });
          }
        });
      }
    });
  }
}

export default new SocketHandler();
