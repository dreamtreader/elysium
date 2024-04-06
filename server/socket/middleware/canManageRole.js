import { classes } from "../../data/classInitializer.js";

const roles = classes.Roles;

export const canManageRole = (locals) => {
  const selfMember = locals.selfMember;
  const role = locals.role;
  const selfHighestRole = roles.getHighestRole(
    selfMember.roleIds.map((roleId) => roleId.toString()),
    selfMember.serverId.toString()
  );
  if (role.position >= selfHighestRole.position)
    throw Error(
      "You are not allowed to manage a role of a higher or equal position than / to yours"
    );
  return true;
};
