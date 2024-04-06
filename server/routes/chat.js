import express from "express";

import { getChatData } from "../controllers/index.js";

import {
  updateUserMiddleware,
  authorizationMiddleware,
} from "../data/middleware/index.js";

const router = express.Router();

///FETCH INITIAL CHAT DATA

router.get("/", updateUserMiddleware(), authorizationMiddleware, getChatData);

export default router;
