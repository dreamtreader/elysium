import {
  updateServer,
  updateMember,
  canManageRole,
} from "../../middleware/index.js";

import { hasPermission } from "../../middleware/hasPermission.js";
import { classes } from "../../../data/classInitializer.js";
import { editSocketMemberData } from "../../editSockets.js";
const roles = classes.Roles;

export class changeMember {
  name = "memberChanged";

  trigger = async (io, socket, payload) => {
    const { displayName, roleIds } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.member = await updateMember(locals, false);

    if (displayName) {
      locals.hasNickPerm = hasPermission("MANAGE_NICKNAME")(locals);
      if (!locals.hasNickPerm) return;
    }
    if (roleIds) {
      locals.hasRolePerm = hasPermission("MANAGE_ROLES")(locals);
      const memberRoles = roles.getMultipleById(roleIds);
      memberRoles.forEach((role) => {
        const canManage = canManageRole({ ...locals, role: role });
        if (!canManage) return;
      });
      if (!locals.hasRolePerm) return;
    }
    ["displayName", "roleIds", "primaryColor", "secondaryColor"].forEach(
      (field) =>
        payload[field] ? (locals.member[field] = payload[field]) : null
    );

    await locals.member.save();

    editSocketMemberData(
      io,
      locals.member.userId.toString(),
      locals.member.serverId.toString(),
      {
        ...(displayName && { displayName: displayName }),
        ...(roleIds && { roleIds: roleIds }),
      }
    );

    io.to(locals.server._id.toString()).emit(this.name, locals.member);
  };
}
