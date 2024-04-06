export class fetchUser {
  name = "usersFetched";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;

    if (!payload) throw Error("User IDs were not provided");

    socket.join(payload);

    console.log(socket.rooms);
  };
}
