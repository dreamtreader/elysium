import { classes } from "../classInitializer.js";

const members = classes.Members;

export const updateMember = async (req, res, next) => {
  const server = res.locals.server;
  const { memberId } = req.params;

  const member = members.getByUserId(memberId, server._id);
  if (!member)
    return next(
      `Member with ID ${memberId} was not found in server with ID ${server._id}`
    );

  res.locals.member = member;

  return next();
};
