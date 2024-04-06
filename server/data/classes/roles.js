import { OVERWRITE_IDS, PermissionTypes } from "../../types/index.js";
import { Member, Role, Server } from "../models/index.js";
export class Roles {
  create = async (options, firstRole = false) => {
    if (!options.serverId) throw Error("Server ID is required");

    const role = new Role({
      ...options,
      position: firstRole ? 0 : 1,
    });

    await role.validate();

    !firstRole
      ? await Role.updateMany(
          { serverId: options.serverId, position: { $gte: 1 } },
          { $inc: { position: 1 } }
        ).exec()
      : null;

    await role.save();

    return role;
  };
  delete = async (id) => {
    if (!id) throw Error("Role ID is required");

    const role = await Role.findById(id);
    if (!role) throw Error("Role not found");

    await role.deleteOne();
    await Role.updateMany(
      { serverId: role.serverId.toString(), position: { $gte: role.position } },
      { $inc: { position: -1 } }
    );
  };
  getById = async (id, lean = true) => {
    if (!id) throw "Role ID not found";
    if (lean) {
      const role = await Role.findById(id).lean().exec();
      if (!role) throw "Role ID invalid";
      return role;
    } else {
      const role = await Role.findById(id).exec();
      if (!role) throw "Role ID invalid";
      return role;
    }
  };

  getMultipleById = async (ids, lean = true) => {
    var roles;
    if (lean) roles = await Role.find().where("_id").in(ids).lean().exec();
    else roles = await Role.find().where("_id").in(ids).exec();
    if (!roles) throw Error("Role IDs invalid");
    return roles;
  };

  getServerRoles = async (serverId) => {
    return await Role.find({ serverId: serverId }).lean().exec();
  };

  getEveryoneRole = async (serverId) => {
    return await Role.findOne({ serverId: serverId, position: 0 })
      .lean()
      .exec();
  };

  accumulateOverwritePerms = (permissionOverwrites) => {
    const allowedPerms = permissionOverwrites.reduce(
      (accumulatedPerms, currentOverwrite) =>
        accumulatedPerms | currentOverwrite.allow,
      0
    );
    const deniedPerms = permissionOverwrites.reduce(
      (accumulatedPerms, currentOverwrite) =>
        accumulatedPerms | currentOverwrite.deny,
      0
    );

    return { allowedPerms: allowedPerms, deniedPerms: deniedPerms };
  };
  applyOverwrites = (permissions, member, channel) => {
    var perms = permissions;
    const roleOverwrites =
      channel.permissionOverwrites?.filter(
        (overwrite) =>
          member.roleIds.includes(overwrite.id) &&
          overwrite.type === OVERWRITE_IDS.ROLE
      ) ?? [];

    const allowedPerms = roleOverwrites.reduce(
      (accumulatedPerms, currentRole) => accumulatedPerms | currentRole.allow,
      0
    );
    const deniedPerms = roleOverwrites.reduce(
      (accumulatedPerms, currentRole) => accumulatedPerms | currentRole.deny,
      0
    );

    perms |= allowedPerms;
    perms &= ~deniedPerms;

    const memberOverwrite = channel.permissionOverwrites?.find(
      (overwrite) => member.userId.toString() === overwrite._id
    );
    if (memberOverwrite) {
      perms |= memberOverwrite.allow;
      perms &= memberOverwrite.deny;
    }
    return perms;
  };

  getPermsInChannel = async (member, channel) => {
    var basePerms = await this.getAllPerms(member.roleIds);
    return this.applyOverwrites(basePerms, member, channel);
  };

  isAbleToInChannel = async (permission, member, channel, server) => {
    const permID = PermissionTypes.All[permission];
    const perms = await this.getPermsInChannel(member, channel);
    const admin =
      member.userId.equals(server.ownerId) ||
      this.ownsPerm(PermissionTypes.All.ADMINISTRATOR, perms);

    if (admin) return true;

    return this.ownsPerm(permID, perms);
  };

  isAbleTo = (permission, member) => {
    const permID = PermissionTypes.All[permission];

    const perms = this.getAllPerms(member.roleIds, member.serverId);
    if (!perms) throw "Member possibly undefined or invalid";
    return this.ownsPerm(permID, perms);
  };

  getAllPerms = async (roleIds, serverId) => {
    const everyoneRole = this.getEveryoneRole(serverId);

    const roles = await this.getMultipleById(roleIds);

    return roles.reduce(
      (accumulatedPerms, currentPerms) => accumulatedPerms | currentPerms,
      everyoneRole.permissions
    );
  };

  isHigher = async (role, member, server) => {
    const highestRole = await this.getHighestRole(
      member.roleIds,
      server._id.toString()
    );
    return (
      role.position <= highestRole.position ||
      member.userId.toString() === server.ownerId.toString()
    );
  };
  canManage = async (member, selfMember, server) => {
    const selfHighestRole = await this.getHighestRole(
      selfMember.roleIds,
      server._id.toString()
    );
    const highestRole = await this.getHighestRole(
      member.roleIds,
      server._id.toString()
    );
    return (
      highestRole.position < selfHighestRole.position ||
      server.ownerId.toString() === selfMember.userId.toString()
    );
  };

  getHighestRole = async (roleIds, serverId) => {
    const roles = await this.getMultipleById(roleIds);
    const highestRole = roles.reduce(
      (previousRole, newRole) =>
        previousRole.position > newRole.position ? previousRole : newRole,
      roles[0]
    );
    if (!highestRole) return await this.getEveryoneRole(serverId);
    return highestRole;
  };

  addPermission = (permission, allPerms) => {
    const permID = PermissionTypes.All[permission];

    if (Boolean(allPerms & permID)) return allPerms;
    return allPerms | permID;
  };
  removePermission = (permission, allPerms) => {
    const permID = PermissionTypes.All[permission];

    if (!Boolean(allPerms & permID)) return allPerms;
    return permID & ~permission;
  };
  ownsPerm = (permission, allPerms) => {
    return (
      Boolean(permission & allPerms) ||
      Boolean(PermissionTypes.All.ADMINISTRATOR & allPerms)
    );
  };
}
