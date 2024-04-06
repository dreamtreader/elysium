import express from "express";
import { updateUserMiddleware } from "../data/middleware/updateUser.js";
import {
  getUserById,
  createUser,
  Login,
  loginByToken,
  setLastReadMessage,
  Logout,
  editUser,
} from "../controllers/user.js";
import { updateChannelMiddleware } from "../data/middleware/updateChannel.js";
import { authorizationMiddleware } from "../data/middleware/authorization.js";

const router = express.Router();

router.get("/", updateUserMiddleware(), loginByToken);
router.get("/logout", updateUserMiddleware(), authorizationMiddleware, Logout);
router.get(
  "/:id",
  updateUserMiddleware(),
  authorizationMiddleware,
  getUserById
);
router.post("/login", Login);
router.post("/create", createUser);

router.post(
  "/edit",
  updateUserMiddleware(false),
  authorizationMiddleware,
  editUser
);

router.post(
  "/lastReadMessages/:channelId",
  updateUserMiddleware(false),
  authorizationMiddleware,
  updateChannelMiddleware(false),
  setLastReadMessage
);

export default router;
