import { classes } from "../../data/classInitializer.js";
import { parse } from "cookie";
const users = classes.Users;

export const updateUser = async (socket, lean = true, next) => {
  const cookies = parse(
    socket.handshake.headers.cookie ? socket.handshake.headers.cookie : ""
  );
  const token = cookies.authorization;
  if (!token) {
    if (next) {
      next("Authorization token not found");
    } else {
      throw Error("Authorization token not found");
    }
  }

  const userId = await users.verifyToken(token);
  const user = await users.getById(userId, lean);
  if (!user) {
    if (next) {
      next("Self user not found");
    } else {
      throw Error("Self user not found");
    }
  }
  return user;
};
