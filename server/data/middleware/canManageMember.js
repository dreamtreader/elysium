import { classes } from "../classInitializer.js";

const roles = classes.Roles;

export const canManageMember = (req, res, next) => {
  const member = res.locals.member;
  const selfMember = res.locals.selfMember;

  const targetHighestRole = roles.getHighestRole(
    member.roleIds.map((roleId) => roleId.toString()),
    selfMember.serverId.toString()
  );
  const selfHighestRole = roles.getHighestRole(
    selfMember.roleIds.map((roleId) => roleId.toString()),
    selfMember.serverId.toString()
  );

  if (targetHighestRole.position >= selfHighestRole.position)
    return next(
      "You are not allowed to manage members of the same or higher roles as yours"
    );
  else return next();
};
