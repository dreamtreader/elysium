import { updateServer, hasPermission } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { PermissionTypes } from "../../../types/index.js";

const roles = classes.Roles;
export class addRole {
  name = "roleAdded";

  trigger = async (io, socket, payload) => {
    const { permissions } = payload;

    const locals = {};
    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];

    const hasPerm = hasPermission("MANAGE_ROLE")(locals);

    if (permissions) {
      const ownPerms = await roles.getAllPerms(
        locals.selfMember.roleIds,
        locals.server._id
      );

      const hasMorePermsThanAllowed =
        Object.values(PermissionTypes.All).find(
          (perm) => !Boolean(ownPerms & perm) && Boolean(permissions & perm)
        ) &&
        !Boolean(ownPerms & PermissionTypes.All.ADMINISTRATOR) &&
        locals.selfMember.userId !== server.ownerId;
      if (hasMorePermsThanAllowed)
        throw Error(
          "You cannot assign a role permissions than you don't have yourself"
        );
    }

    if (!hasPerm) return;

    const role = await roles.create({
      ...payload,
      serverId: locals.server._id.toString(),
    });

    io.to(locals.server._id.toString()).emit(this.name, role);
  };
}
