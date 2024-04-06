import { classes } from "../classInitializer.js";

const roles = classes.Roles;

export const updateRole = async (req, res, next) => {
  const { roleId } = req.params;

  const role = roles.getById(roleId);
  if (!role) return next(`Role of ID ${roleId} not found`);

  res.locals.role = role;
  return next();
};
