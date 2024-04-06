import { updateServer, updateChannel } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { hasPermission } from "../../middleware/hasPermission.js";
import { PermissionTypes } from "../../../types/index.js";

const channels = classes.Channels;
const roles = classes.Roles;

export class changeServerChannel {
  name = "serverChannelChanged";

  trigger = async (io, socket, payload) => {
    const { topicId, name, permissionOverwrites } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.channel = await updateChannel(payload, false);
    locals.hasPerm = hasPermission("MANAGE_CHANNEL")(locals, true);

    if (!locals.hasPerm) return;

    name && name !== locals.channel.name ? (locals.channel.name = name) : null;
    if (topicId && topicId !== locals.channel.topicId.toString()) {
      locals.channel.position = 1;
      await channels.incrementChannelPositions({
        topicId: topicId,
        position: { $gte: 1 },
      });
      locals.channel.topicId = topicId;
    }

    await locals.channel.validate();

    if (
      permissionOverwrites &&
      permissionOverwrites !== locals.channel.permissionOverwrites
    ) {
      const ownPerms = await roles.getPermsInChannel(
        locals.selfMember,
        locals.channel
      );

      const perms = roles.accumulateOverwritePerms(permissionOverwrites);

      const hasMorePermsThanAllowed =
        Object.values(PermissionTypes.All).find(
          (perm) =>
            !Boolean(ownPerms & perm) &&
            (Boolean(perms.allowedPerms & perm) ||
              Boolean(perms.deniedPerms & perm))
        ) &&
        !Boolean(
          ownPerms & PermissionTypes.All.ADMINISTRATOR ||
            ownPerms & PermissionTypes.All.MANAGE_CHANNEL
        ) &&
        member.userId.toString() !== server.ownerId.toString();
      if (hasMorePermsThanAllowed)
        throw Error(
          "You cannot assign a channel permission overwrites that you don't have yourself"
        );

      const sockets = await io
        .in(locals.channel.topicId.toString())
        .fetchSockets();

      sockets.forEach((socket) => {
        locals.user = socket.data.user;
        locals.selfMember = socket.data.members[locals.server._id.toString()];
        const hasPerm = hasPermission("VIEW_CHANNEL")(locals, true);
        if (!hasPerm && socket.rooms.has(locals.channel._id.toString())) {
          socket.leave(locals.channel._id.toString());
          socket.emit("channelRemoved", locals.channel._id);
        }
        if (hasPerm && !socket.rooms.has(locals.channel._id.toString())) {
          socket.join(locals.channel._id.toString());
          socket.emit("channelAdded", locals.channel._id.toString());
        }
      });
    }
    await locals.channel.save();

    io.to(locals.channel._id.toString()).emit("channelChanged", locals.channel);
  };
}
