import { classes } from "../../../data/classInitializer.js";
import { editSocketUserData } from "../../editSockets.js";
const users = classes.Users;

export class addFriend {
  name = "friendAdded";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { userId } = payload;

    if (!userId) throw Error("User ID was not provided");
    if (userId === locals.user._id.toString())
      throw Error("You can't friend yourself");
    const user = await users.getById(userId, false);
    if (!user) throw Error("User is not valid");
    if (locals.user.friends.includes(user._id.toString()))
      throw Error("You're already friends with this user");

    const friendRequest = locals.user.friendRequests.find(
      (friendRequest) =>
        friendRequest.transmitter.toString() == user._id.toString()
    );
    if (!friendRequest)
      throw Error("There is no friend request from this user to accept");

    locals.user.set({
      friendRequests: locals.user.friendRequests.filter(
        (friendRequest) =>
          friendRequest.transmitter.toString() !== user._id.toString()
      ),
    });

    locals.user.friends = [...locals.user.friends, user._id.toString()];

    user.set({
      friendRequests: user.friendRequests.filter(
        (friendRequest) =>
          friendRequest.receiver.toString() !== locals.user._id.toString()
      ),
    });

    user.friends = [...user.friends, locals.user._id.toString()];

    await Promise.all([locals.user.save(), user.save()]);

    socket.data.user.friends = locals.user.friends;
    socket.data.user.friendRequests = locals.user.friendRequests;

    socket.emit(this.name, user._id.toString());

    const sockets = await io.in(locals.user._id.toString()).fetchSockets();

    const friendedUser = sockets.find(
      (socket) => socket.data.user._id.toString() === user._id.toString()
    );
    if (friendedUser) {
      friendedUser.data.user.friends = user.friends;
      friendedUser.data.user.friendRequests = user.friendRequests;
      friendedUser.emit(this.name, locals.user._id.toString());
    }
  };
}
