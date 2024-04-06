import { classes } from "../../../data/classInitializer.js";
const users = classes.Users;
export class removeFriendRequest {
  name = "friendRequestRemoved";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { userId } = payload;

    if (!userId) throw Error("User ID was not provided");
    if (userId === locals.user._id.toString())
      throw Error("You can't have a friend request from yourself");

    const user = await users.getById(userId, false);
    if (!user) throw Error("User not found");

    const friendRequest = locals.user.friendRequests.find(
      (friendRequest) =>
        friendRequest.transmitter.toString() === userId ||
        friendRequest.receiver.toString() === userId
    );
    if (!friendRequest)
      throw Error("You have no friend request towards this user");

    locals.user.friendRequests = locals.user.friendRequests.filter(
      (friendRequest) =>
        friendRequest.transmitter.toString() !== userId &&
        friendRequest.receiver.toString() !== userId
    );

    user.friendRequests = user.friendRequests.filter(
      (friendRequest) =>
        friendRequest.transmitter.toString() !== locals.user._id.toString() &&
        friendRequest.receiver.toString() !== locals.user._id.toString()
    );

    await Promise.all([locals.user.save(), user.save()]);

    socket.data.user.friendRequests = locals.user.friendRequests;
    socket.emit("friendRequestRemoved", friendRequest);

    const sockets = await io.in(locals.user._id.toString()).fetchSockets();

    const friendRequestedUser = sockets.find(
      (socket) => socket.data.user._id.toString() === user._id.toString()
    );
    if (friendRequestedUser) {
      friendRequestedUser.data.user.friendRequests = user.friendRequests;
      friendRequestedUser.emit(this.name, friendRequest);
    }
  };
}
