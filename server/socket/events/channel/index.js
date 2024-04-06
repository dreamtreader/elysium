import { addMessage } from "./addMessage.js";
import { addDM } from "./addDM.js";
import { changeMessage } from "./changeMessage.js";
import { addGroupDM } from "./addGroupDM.js";
import { removeMessage } from "./removeMessage.js";
export const channelEvents = {
  addMessage: new addMessage(),
  addDM: new addDM(),
  addGroupDM: new addGroupDM(),
  editMessage: new changeMessage(),
  removeMessage: new removeMessage(),
};
