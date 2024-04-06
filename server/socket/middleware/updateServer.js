import { classes } from "../../data/classInitializer.js";

const servers = classes.Servers;

export const updateServer = async (payload, lean = true) => {
  const { serverId } = payload;
  const server = await servers.getById(serverId, lean);
  if (!server) throw Error("Server is required to perform this action");
  return server;
};
