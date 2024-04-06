import User from "../data/models/user.js";
import { classes } from "../data/classInitializer.js";
import mongoose, { Mongoose } from "mongoose";
import cloudinary from "cloudinary";
const users = classes.Users;
const messages = classes.Messages;
export const getUserById = async (req, res) => {
  try {
    const user = users.getSafely(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const body = req.body;
  const { avatar } = body;
  const newUser = new User(body);

  try {
    await newUser.save();
    if (avatar) {
      cloudinary.v2.uploader
        .upload(avatar, {
          folder: `avatars/users`,
          public_id: newUser._id.toString(),
          tags: `${newUser._id.toString()}`,
        })
        .then((result) => (newUser.avatar = result.secure_url));
      await newUser.save();
    }
    const token = await users.generateToken(newUser);
    res.cookie("authorization", token, {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: false,
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    res.status(409).send(error.message);
  }
};

export const loginByToken = (req, res) => {
  return res.status(200).json(res.locals.user);
};

export const setLastReadMessage = async (req, res) => {
  try {
    const user = res.locals.user;
    const channel = res.locals.channel;
    const { messageId } = req.body;

    console.log(user);
    console.log(user instanceof mongoose.Document);
    if (!messageId) res.status(400).json("Message ID is required");
    const message = await messages.getById(messageId);
    if (!message) res.status(400).json("Message ID is invalid");

    user.lastReadMessageIds = {
      ...user.lastReadMessageIds,
      [channel._id.toString()]: message._id.toString(),
    };

    await user.save();

    res.status(200).json("Last read message successfully updated.");
  } catch (err) {
    res.status(400).json(err.message);
  }
};

export const editUser = async (req, res) => {
  const user = res.locals.user;
  const { email, oldPassword, password } = req.body;
  try {
    if (email && email != user.email) user.email = email;
    if (password) {
      if (user.checkPassword(oldPassword)) {
        user.password = password;
      }
    }
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};
export const Login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res
      .status(400)
      .json({ message: "Username or password doesn't exist" });
  try {
    const user = await User.findOne({ username: `${username}` }).exec();
    if (!user) return res.status(400).json({ message: "Not found" });
    if (user.checkPassword(password)) {
      const token = await users.generateToken(user);

      res.cookie("authorization", token, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: false,
      });

      return res.status(200).json(user._doc);
    } else {
      return res.status(400).json({ message: "Password invalid" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const Logout = async (req, res) => {
  try {
    res.clearCookie("authorization");
    res.status(200).json({ message: "Successfully logged out" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
