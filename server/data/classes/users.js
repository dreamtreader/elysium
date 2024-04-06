import jwt from "jsonwebtoken";

import { User } from "../models/index.js";
export class Users {
  create = async ({ displayName, username, password, ...options }) => {
    if (!displayName || !username || !password)
      throw Error("Display name, username and password are required");
    return await User.create({
      displayName: displayName,
      username: username,
      password: username,
      ...options,
    });
  };

  generateToken = async (user) => {
    return jwt.sign({ id: user._id }, process.env.AUTH_TOKEN, {
      algorithm: "RS512",
      expiresIn: "7d",
    });
  };

  verifyToken = async (token) => {
    if (!token) throw Error("Token expired or inexistent");
    const decodedToken = jwt.verify(token, process.env.AUTH_TOKEN, {
      algorithms: ["RS512"],
    });
    return decodedToken?.id;
  };

  getById = async (userId, lean = true) => {
    if (!userId) throw Error("User ID not provided");
    else return await User.findById(userId).lean(lean).exec();
  };

  getSafely = async (userId) => {
    const user = await User.findById(userId, ["-password", "-email"])
      .lean()
      .exec();
    if (!user) throw Error("User not existent");
    return user;
  };
}
