import { classes } from "../../data/classInitializer.js";

const channels = classes.Channels;

export const updateChannel = async (payload, lean = true) => {
  const { channelId } = payload;
  if (!channelId) throw Error("Channel ID not found");
  const channel = await channels.getById(channelId, lean);
  if (!channel) throw Error("Channel was not found");
  return channel;
};
