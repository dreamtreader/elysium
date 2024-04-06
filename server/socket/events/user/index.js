import { addFriend } from "./addFriend.js";
import { addFriendRequest } from "./addFriendRequest.js";
import { changeUser } from "./changeUser.js";
import { fetchUser } from "./fetchUsers.js";
import { removeFriend } from "./removeFriend.js";
import { removeFriendRequest } from "./removeFriendRequest.js";
import { changeActivityStatus } from "./changeActivityStatus.js";
export const userEvents = {
  addFriendRequest: new addFriendRequest(),
  addFriend: new addFriend(),
  changeUser: new changeUser(),
  fetchUser: new fetchUser(),
  removeFriend: new removeFriend(),
  removeFriendRequest: new removeFriendRequest(),
  changeActivityStatus: new changeActivityStatus(),
};
