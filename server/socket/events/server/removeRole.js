import {
  updateServer,
  hasPermission,
  updateRole,
  canManageRole,
} from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import Role from "../../../data/models/role.js";

const members = classes.Members;

export class removeRole {
  name = "roleRemoved";

  trigger = async (io, socket, payload) => {
    const { serverId } = payload;

    const locals = {};
    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.role = await updateRole(payload, false);

    const hasPerm = hasPermission("MANAGE_ROLE")(locals);
    const canManage = canManageRole(locals);
    if (locals.role.position === 0)
      throw Error("You cannot remove the @everyone role");
    if (!hasPerm || !canManage) return;

    await Promise.all([
      locals.role.deleteOne(),
      await Role.updateMany(
        {
          serverId: locals.role.serverId.toString(),
          position: { $gte: locals.role.position },
        },
        { $inc: { position: -1 } }
      ),
      members.removeRoleFromAllMembers(locals.role),
    ]);

    io.to(serverId).emit(this.name, { _id: payload.roleId });
  };
}
