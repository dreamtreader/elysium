import { classes } from "../classInitializer.js";

const topics = classes.Topics;

export const updateTopicMiddleware = async (req, res, next) => {
  const channel = res.locals.channel;

  var topicId;

  if (channel) {
    topicId = channel.topicId;
  } else {
    topicId = req.params.topicId;
  }
  const topic = await topics.getById(topicId);
  if (!topic) next("Topic not found");
  res.locals.topic = topic;
  next();
};
