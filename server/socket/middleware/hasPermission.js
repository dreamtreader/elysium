import { PermissionTypes } from "../../types/index.js";
import { classes } from "../../data/classInitializer.js";

const roles = classes.Roles;

export const hasPermission =
  (permission) =>
  (locals, inChannel = false, inTopic = false) => {
    const server = locals.server;
    const member = locals.selfMember;
    if (inChannel) {
      const channel = locals.channel;

      const allowed =
        roles.isAbleToInChannel(permission, member, channel, server) ||
        member.userId.equals(server.ownerId);

      if (!allowed)
        throw Error("You do now own the following permission: " + permission);
    } else if (inTopic) {
      const topic = locals.topic;

      const allowed =
        roles.isAbleToInChannel(permission, member, topic, server) ||
        member.userId.equals(server.ownerId);

      if (!allowed)
        throw Error("You do now own the following permission: " + permission);
    } else {
      const allowed =
        roles.isAbleTo(permission, member) ||
        member.userId.equals(server.ownerId);
      if (!allowed)
        throw Error("You do now own the following permission: " + permission);
    }
    return true;
  };
