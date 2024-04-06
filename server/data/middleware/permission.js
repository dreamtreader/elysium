import { classes } from "../classInitializer.js";
const roles = classes.Roles;
const members = classes.Members;

export const permissionMiddleware =
  (permission, inChannel = false, inTopic = false) =>
  async (req, res, next) => {
    const server = res.locals.server;
    const user = res.locals.user;
    const member = await members.getByUserId(user._id, server._id);

    if (!member)
      return res
        .status(401)
        .json({ message: "You are not part of this server" });

    if (inChannel) {
      const channel = res.locals.channel;

      const allowed =
        roles.isAbleToInChannel(permission, member, channel, server) ||
        member.userId.equals(server.ownerId);
      if (!allowed)
        return res.status(401).json({
          message: "You do now own the following permission: " + permission,
        });
    } else if (inTopic) {
      const topic = res.locals.topic;
      const allowed =
        roles.isAbleToInChannel(permission, member, topic, server) ||
        member.userId.equals(server.ownerId);
      if (!allowed)
        return next({
          message: "You do now own the following permission: " + permission,
        });
    } else {
      const allowed =
        roles.isAbleTo(permission, member) ||
        member.userId.equals(server.ownerId);
      if (!allowed)
        return next({
          message: "You do now own the following permission: " + permission,
        });
    }
    next();
  };
