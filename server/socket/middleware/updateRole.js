import { classes } from "../../data/classInitializer.js";

const roles = classes.Roles;

export const updateRole = async (payload, lean = true) => {
  const { roleId } = payload;
  if (!roleId) throw Error("Role ID not found");
  const role = await roles.getById(roleId, lean);
  if (!role) throw Error("Role was not found");
  return role;
};
