import { classes } from "../classInitializer.js";

const messages = classes.Members;

export const updateMessageMiddleware = async (req, res, next) => {
  const { messageId } = req.params;

  const message = messages.getById(message);
  if (!message) return next(`Message of ID ${messageId} not found`);

  res.locals.message = message;
  return next();
};
