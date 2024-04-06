import { classes } from "../../data/classInitializer.js";

const roles = classes.Roles;

export const canManageMember = (locals) => {
  const selfMember = locals.selfMember;
  const member = locals.member;

  const targetHighestRole = roles.getHighestRole(
    member.roleIds.map((roleId) => roleId.toString()),
    member.serverId.toString()
  );
  const selfHighestRole = roles.getHighestRole(
    selfMember.map((roleId) => roleId.toString()),
    member.serverId.toString()
  );

  if (targetHighestRole.position >= selfHighestRole.position)
    throw Error(
      "You are not allowed to manage members of the same or higher roles as yours"
    );
  return true;
};
