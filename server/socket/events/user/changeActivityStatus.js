export class changeActivityStatus {
  name = "activityStatusChanged";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { isOnline } = payload;
    locals.user.isOnline = isOnline;
    await locals.user.save();
    socket.data.user.isOnline = isOnline;
    io.in(locals.user._id.toString()).emit("userChanged", {
      _id: socket.data.user._id.toString(),
      isOnline: isOnline,
    });
  };
}
