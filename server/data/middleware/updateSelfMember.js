import { classes } from "../classInitializer.js";

const members = classes.Members;

export const updateSelfMember = async (req, res, next) => {
  const server = res.locals.server;
  const user = res.locals.user;

  const member = members.getByUserId(user._id, server._id);
  if (!member)
    return next(
      `Member for user with ID ${user._id} was not found in server with ID ${server._id}`
    );

  res.locals.selfMember = member;
  return next();
};
