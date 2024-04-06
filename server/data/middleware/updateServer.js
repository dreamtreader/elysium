import { classes } from "../classInitializer.js";

const servers = classes.Servers;

export const updateServerMiddleware =
  (lean = true) =>
  async (req, res, next) => {
    const channel = res.locals.channel;

    var serverId;

    if (channel) {
      serverId = channel.serverId;
    } else {
      serverId = req.params.serverId;
    }

    const server = await servers.getById(serverId, lean);

    if (!server) return next("Server not found");
    res.locals.server = server;
    return next();
  };
