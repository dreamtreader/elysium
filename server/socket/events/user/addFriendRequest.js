import { User } from "../../../data/models/index.js";
import { classes } from "../../../data/classInitializer.js";

const users = classes.Users;

export class addFriendRequest {
  name = "friendRequestAdded";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { userId } = payload;

    if (!userId) throw Error("User ID was not provided");
    if (userId === locals.user._id.toString())
      throw Error("You can't friend yourself");
    const user = await users.getById(userId, false);
    if (!user) throw Error("User is not valid");
    if (
      locals.user.friendRequests.find(
        (friendRequest) =>
          friendRequest.receiver.toString() == user._id.toString()
      )
    )
      throw Error("You've already sent a friend request to this user");
    if (
      locals.user.friendRequests.find(
        (friendRequest) =>
          friendRequest.transmitter.toString() == user._id.toString()
      )
    )
      throw Error("You've already been sent a friend request from this user");
    if (locals.user.friends.includes(user._id.toString()))
      throw Error("You're already friends with this user");

    locals.user.set({
      friendRequests: [
        ...locals.user.friendRequests,
        {
          transmitter: locals.user._id.toString(),
          receiver: user._id.toString(),
        },
      ],
    });

    user.friendRequests = [
      ...user.friendRequests,
      {
        transmitter: locals.user._id.toString(),
        receiver: user._id.toString(),
      },
    ];

    await Promise.all([locals.user.save(), user.save()]);

    socket.join(user._id.toString());
    socket.data.user.friendRequests = locals.user.friendRequests;
    socket.emit("friendRequestAdded", {
      transmitter: locals.user._id.toString(),
      receiver: user._id.toString(),
    });

    const sockets = await io.in(locals.user._id.toString()).fetchSockets();

    const friendRequestedUser = sockets.find(
      (socket) => socket.data.user._id.toString() === user._id.toString()
    );
    if (friendRequestedUser) {
      friendRequestedUser.data.user.friendRequests = user.friendRequests;
      friendRequestedUser.emit(this.name, {
        transmitter: locals.user._id.toString(),
        receiver: user._id.toString(),
      });
    }
  };
}
