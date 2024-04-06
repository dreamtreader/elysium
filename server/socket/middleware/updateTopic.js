import { classes } from "../../data/classInitializer.js";

const topics = classes.Topics;

export const updateTopic = async (payload, lean = true) => {
  const { topicId } = payload;
  if (!topicId) throw Error("Topic ID not found");
  const topic = await topics.getById(topicId, lean);
  if (!topic) throw Error("Topic was not found");
  return topic;
};
