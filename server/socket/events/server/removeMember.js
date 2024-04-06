import {
  updateSelfMember,
  updateServer,
  hasPermission,
  canManageMember,
  updateUser,
  updateMember,
} from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";

const members = classes.Members;
export class removeMember {
  name = "memberRemoved";

  trigger = async (io, socket, payload) => {
    const { serverId, memberId } = payload;
    const locals = {};
    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.member = await updateMember(payload, true);
    locals.selfMember = socket.data.members[serverId];

    if (locals.selfMember._id.toString() === locals.member._id.toString())
      throw Error("You cannot kick yourself");

    const hasPerm = hasPermission("KICK_MEMBER")(locals);
    const canManage = canManageMember(locals);

    if (!hasPerm || !canManage) throw Error("You cannot kick this member");

    const sockets = await io.in(serverId).fetchSockets();
    const fetchedSocket = sockets.find(
      (socket) =>
        socket.data.members[serverId]._id.toString() ===
        locals.member._id.toString()
    );
    if (fetchedSocket) {
      delete fetchedSocket.data.members[serverId];
    }
    await members.removeMember(locals.selfMember._id);
    io.to(serverId).emit(this.name, locals.selfMember._id);
  };
}
