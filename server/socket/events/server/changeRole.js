import {
  updateServer,
  hasPermission,
  updateSelfMember,
  updateRole,
  canManageRole,
} from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { PermissionTypes } from "../../../types/index.js";
import Role from "../../../data/models/role.js";

const roles = classes.Roles;
export class changeRole {
  name = "roleChanged";

  trigger = async (io, socket, payload) => {
    const { permissions, position } = payload;

    const locals = {};
    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.role = await updateRole(payload, false);

    const hasPerm = hasPermission("MANAGE_ROLE")(locals);
    const canManage = canManageRole(locals);

    const highestRole = await roles.getHighestRole(
      locals.selfMember.roleIds.map((roleId) => roleId.toString()),
      locals.server._id.toString()
    );

    if (permissions && permissions !== locals.role.permissions) {
      const ownPerms = await roles.getAllPerms(
        locals.selfMember.roleIds.map((roleId) => roleId.toString()),
        locals.server._id.toString()
      );

      const hasMorePermsThanAllowed =
        Object.values(PermissionTypes.All).find(
          (perm) => !Boolean(ownPerms & perm) && Boolean(permissions & perm)
        ) &&
        !Boolean(ownPerms & PermissionTypes.All.ADMINISTRATOR) &&
        locals.selfMember.userId.toString() !==
          locals.server.ownerId.toString();
      if (hasMorePermsThanAllowed)
        throw Error(
          "You cannot assign a role permissions that you don't have yourself"
        );
    }

    if (!hasPerm || !canManage) return;

    if (position) {
      if (
        position >= highestRole.position &&
        locals.selfMember.userId.toString() !== locals.server.ownerId.toString()
      )
        throw Error("You cannot set a position higher than your highest role");
    }

    console.log(payload);
    ["name", "color", "permissions", "position"].forEach((field) => {
      if (payload[field]) locals.role[field] = payload[field];
    });
    await locals.role.save();

    io.to(locals.server._id.toString()).emit(this.name, locals.role);
  };
}
