export const editSocketUserData = async (io, userId, editedFields) => {
  const sockets = await io.in(userId).fetchSockets();

  const userSocket = sockets.find(
    (socket) => socket.data.user._id.toString() === userId
  );
  if (userSocket) {
    for (const [key, value] of Object.entries(editedFields)) {
      userSocket.data.user[key] = value;
    }

    return userSocket;
  }
};

export const editSocketMemberData = async (
  io,
  userId,
  serverId,
  editedFields
) => {
  const sockets = await io.in(userId).fetchSockets();

  const memberSocket = sockets.find(
    (socket) => socket.data.user._id.toString() === userId
  );

  if (memberSocket) {
    for (const [key, value] of Object.entries(editedFields)) {
      memberSocket.data.members[serverId][key] = value;
    }

    return memberSocket;
  }
};
