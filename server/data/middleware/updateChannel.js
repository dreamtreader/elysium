import { classes } from "../classInitializer.js";

const channels = classes.Channels;

export const updateChannelMiddleware =
  (lean = true) =>
  async (req, res, next) => {
    var { channelId } = req.params;

    if (!channelId) {
      channelId = req.query.channelId;
    }

    const channel = await channels.getById(channelId, lean);
    if (!channel) next("Channel not found");
    res.locals.channel = channel;
    next();
  };
