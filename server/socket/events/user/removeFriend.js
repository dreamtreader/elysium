import { classes } from "../../../data/classInitializer.js";
const users = classes.Users;
export class removeFriend {
  name = "friendRemoved";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { userId } = payload;

    if (!userId) throw Error("User ID was not provided");
    if (userId === locals.user._id.toString())
      throw Error("You can't unfriend yourself");

    const user = await users.getById(userId, false);
    if (!user) throw Error("User not found");

    const friend = locals.user.friends.find(
      (friend) => friend.toString() === userId
    );
    if (!friend) throw Error("User is not your friend");

    locals.user.friends = locals.user.friends.filter(
      (friend) => friend.toString() !== userId
    );
    user.friends = user.friends.filter(
      (friend) => friend.toString() !== locals.user._id.toString()
    );
    await Promise.all([locals.user.save(), user.save()]);

    socket.data.user.friends = locals.user.friends;
    socket.emit(this.name, user._id.toString());

    const sockets = await io.in(locals.user._id.toString()).fetchSockets();

    const friendedUser = sockets.find(
      (socket) => socket.data.user._id.toString() === user._id.toString()
    );
    if (friendedUser) {
      friendedUser.data.user.friends = user.friends;
      friendedUser.emit(this.name, locals.user._id.toString());
    }
  };
}
