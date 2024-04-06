import {
  updateMember,
  updateUser,
  updateServer,
  updateRole,
  canManageRole,
  hasPermission,
} from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { editSocketMemberData } from "../../editSockets.js";

const members = classes.Members;
export class removeMemberRole {
  name = "memberRoleRemoved";

  trigger = async (io, socket, payload) => {
    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.role = await updateRole(payload);
    locals.member = await updateMember(payload, false);

    const hasPerm = hasPermission("MANAGE_ROLE")(locals);
    const canManage = canManageRole(locals);

    if (!canManage || !hasPerm) return;
    members.removeRole(locals.member, locals.role._id.toString());

    await editSocketMemberData(
      io,
      locals.member.userId.toString(),
      locals.member.serverId.toString(),
      { roleIds: locals.member.roleIds }
    );

    io.to(locals.member.serverId.toString()).emit(
      "memberChanged",
      locals.member
    );
  };
}
