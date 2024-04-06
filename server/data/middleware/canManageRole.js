import { classes } from "../classInitializer.js";

const roles = classes.Roles;

export const canManageRole = (req, res, next) => {
  const selfMember = res.locals.selfMember;
  const role = self.locals.role;
  const selfHighestRole = roles.getHighestRole(
    selfMember.roleIds.map((roleId) => roleId.toString()),
    selfMember.serverId.toString()
  );

  if (role.position >= selfHighestRole.position)
    return next(
      "You are not allowed to manage a role of higher position than yours"
    );
  else return next();
};
