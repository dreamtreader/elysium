import { addPost } from "./addPost.js";
import { changePost } from "./changePost.js";
import { removePost } from "./removePost.js";

export const topicEvents = {
  addPost: new addPost(),
  changePost: new changePost(),
  removePost: new removePost(),
};
