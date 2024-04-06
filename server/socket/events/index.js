import { serverEvents } from "./server/index.js";
import { channelEvents } from "./channel/index.js";
import { userEvents } from "./user/index.js";
import { topicEvents } from "./topic/index.js";

export const socketEvents = {
  ...serverEvents,
  ...channelEvents,
  ...userEvents,
  ...topicEvents,
};

export default socketEvents;
