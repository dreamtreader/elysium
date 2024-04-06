import { classes } from "../../data/classInitializer.js";

const messages = classes.Messages;

export const updateMessage = async (payload, lean = true) => {
  const { messageId } = payload;
  if (!messageId) throw Error("Message ID not found");
  const message = await messages.getById(messageId, lean);
  if (!message) throw Error("Message was not found");
  return message;
};
