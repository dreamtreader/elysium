import { updateServer, updateTopic } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { hasPermission } from "../../middleware/hasPermission.js";
import { PermissionTypes } from "../../../types/index.js";
import Role from "../../../data/models/role.js";
import Member from "../../../data/models/member.js";
import cloudinary from "cloudinary";

const roles = classes.Roles;
const channels = classes.Channels;

export class changeTopic {
  name = "topicChanged";

  trigger = async (io, socket, payload) => {
    const { permissionOverwrites, avatar } = payload;

    const locals = {};

    console.log("test");
    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    locals.topic = await updateTopic(payload, false);
    locals.hasPerm = hasPermission("MANAGE_CHANNEL")(locals, false, true);

    if (!locals.hasPerm)
      throw Error("You do not have permissions to change this topic");

    ["name", "position"].forEach((field) =>
      payload[field] ? (locals.topic[field] = payload[field]) : null
    );

    if (
      permissionOverwrites &&
      permissionOverwrites !== locals.topic.permissionOverwrites
    ) {
      const ownPerms = await roles.getPermsInChannel(
        locals.selfMember,
        locals.topic
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
        locals.selfMember.userId.toString() !==
          locals.server.ownerId.toString();
      if (hasMorePermsThanAllowed)
        throw Error(
          "You cannot assign a channel permission overwrites that you don't have yourself"
        );

      for (const overwrite of permissionOverwrites) {
        if (overwrite.type === 0) {
          const role = await roles.getById(overwrite.id);
          if (!role) throw Error("Overwrite with unknown role found");
          locals.isHigher = await roles.isHigher(
            role,
            locals.selfMember,
            locals.server
          );
          if (!locals.isHigher)
            throw Error(
              "You cannot add an overwrite for a role of higher position than yours"
            );
        } else {
          const member = await Member.findById(overwrite.id);
          if (!member) throw Error("Overwrite with unknown member found");
          locals.canManage = await roles.canManage(
            member,
            locals.selfMember,
            locals.server
          );
          if (!locals.canManage)
            throw Error(
              "You cannot add an overwrite for a member of higher position than yours"
            );
        }
      }
    }

    locals.topic.permissionOverwrites = permissionOverwrites;

    if (avatar && avatar !== locals.topic.avatar) {
      await cloudinary.v2.uploader
        .upload(avatar, {
          upload_preset: "elysium",
          folder: `avatars/topics`,
          public_id: payload.topicId,
          tags: `${payload.serverId}, ${payload.topicId}`,
        })
        .then((result) => {
          locals.topic.avatar = result.secure_url;
        });
    }

    await locals.topic.save();

    const sockets = await io.in(locals.topic._id.toString()).fetchSockets();
    const topicChannels = await channels.getTopicChannels(
      locals.topic._id.toString(),
      ["_id", "permissionOverwrites"],
      true
    );
    sockets.forEach((socket) => {
      locals.user = socket.data.user;
      locals.selfMember = socket.data.members[locals.server._id.toString()];

      const filteredChannels = topicChannels
        .filter((channel) => {
          locals.channel = channel;
          const hasPermChannel = hasPermission("VIEW_CHANNEL")(
            locals,
            true,
            false
          );
          if (hasPermChannel) return true;
          return false;
        })
        .map((channel) => channel._id.toString());

      const hasPerm = hasPermission("VIEW_CHANNEL")(locals, false, true);

      if (!hasPerm && socket.rooms.has(locals.topic._id.toString())) {
        socket.leave(locals.topic._id.toString());
        socket.leave(filteredChannels);
        socket.emit("channelsRemoved", filteredChannels);
        socket.emit("topicRemoved", locals.topic._id.toString());
      }
      if (hasPerm && !socket.rooms.has(locals.topic._id.toString())) {
        socket.join(locals.topic._id.toString());
        socket.join(filteredChannels);
        socket.emit("topicAdded", locals.topic._id.toString());
      }
    });

    io.to(locals.topic._id.toString()).emit("topicChanged", locals.topic);
  };
}
