import { classes } from "../../../data/classInitializer.js";
import roomHandler from "../../handleRooms.js";
import { hasPermission } from "../../middleware/hasPermission.js";
import { updateServer } from "../../middleware/updateServer.js";

const invites = classes.Invites;

export class addInvite {
  name = "inviteAdded";

  trigger = async (io, socket, payload) => {
    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];

    const hasPerm = hasPermission("CREATE_INVITE")(locals);
    if (!hasPerm) return;

    const invite = await invites.create({
      serverId: locals.server._id.toString(),
      authorId: locals.user._id.toString(),
    });

    const sockets = await io.in(locals.server._id.toString()).fetchSockets();
    sockets.forEach((socket) => {
      locals.user = socket.data.user;
      locals.selfMember = socket.data.members[locals.server._id];
      const hasPerm = hasPermission("MANAGE_SERVER")(locals);
      if (!hasPerm) return;
      socket.emit("inviteAdded", invite);
    });
  };
}
