import express from "express";
import {
  getChannelMessages,
  createMessage,
  createChannel,
  getFilteredChannelMessages,
} from "../controllers/index.js";
import { CHANNEL_IDS } from "../types/index.js";
import {
  updateUserMiddleware,
  updateChannelMiddleware,
  updateServerMiddleware,
  isRecipientMiddleware,
  contextualMiddleware,
  authorizationMiddleware,
  permissionMiddleware,
  ownershipMiddleware,
} from "../data/middleware/index.js";

const router = express.Router();

router.post(
  "/",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware,
  contextualMiddleware(
    (locals) => locals.channel.type === CHANNEL_IDS.TEXT,
    permissionMiddleware,
    ["MANAGE_CHANNEL"]
  ),
  createChannel
);

router.get(
  "/:channelId",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateChannelMiddleware(true),
  contextualMiddleware(
    (locals) => locals.channel.type === CHANNEL_IDS.TEXT,
    permissionMiddleware,
    ["VIEW_CHANNEL", true]
  ),
  contextualMiddleware(
    (locals) =>
      locals.channel.type === CHANNEL_IDS.GROUP_DM ||
      locals.channel.type === CHANNEL_IDS.DM,
    isRecipientMiddleware
  )
);

router.get(
  "/:channelId/messages/filter",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateChannelMiddleware(true),
  contextualMiddleware(
    (locals) =>
      locals.channel.type === CHANNEL_IDS.GROUP_DM ||
      locals.channel.type === CHANNEL_IDS.DM,
    isRecipientMiddleware
  ),
  getFilteredChannelMessages
);

router.patch(
  "/:channelId",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateChannelMiddleware(true),
  contextualMiddleware(
    (local) => local.channel.type === CHANNEL_IDS.TEXT,
    permissionMiddleware,
    ["MANAGE_CHANNEL", true]
  ),
  contextualMiddleware(
    (local) =>
      local.channel.type === CHANNEL_IDS.GROUP_DM ||
      local.channel.type === CHANNEL_IDS.DM,
    isRecipientMiddleware
  )
);

router.get(
  "/:channelId/messages",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateChannelMiddleware(true),
  contextualMiddleware(
    (local) => local.channel.type === CHANNEL_IDS.TEXT,
    updateServerMiddleware(true)
  ),
  contextualMiddleware(
    (local) => local.channel.type === CHANNEL_IDS.TEXT,
    permissionMiddleware("VIEW_MESSAGE", true)
  ),
  contextualMiddleware(
    (local) =>
      local.channel.type === CHANNEL_IDS.GROUP_DM ||
      local.channel.type === CHANNEL_IDS.DM,
    isRecipientMiddleware
  ),
  getChannelMessages
);

router.delete(
  "/:channelId",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateChannelMiddleware(false),
  contextualMiddleware(
    (locals) => locals.channel.type === CHANNEL_IDS.TEXT,
    permissionMiddleware,
    ["MANAGE_CHANNEL", true]
  ),
  contextualMiddleware(
    (locals) => locals.channel.type === CHANNEL_IDS.GROUP_DM,
    ownershipMiddleware,
    "channel"
  )
);

router.post(
  "/:channelId/messages",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateChannelMiddleware(true),
  updateServerMiddleware,
  contextualMiddleware(
    (local) => local.channel.type === CHANNEL_IDS.TEXT,
    permissionMiddleware,
    ["SEND_MESSAGE", true]
  ),
  contextualMiddleware(
    (local) =>
      local.channel.type === CHANNEL_IDS.GROUP_DM ||
      local.channel.type === CHANNEL_IDS.DM,
    isRecipientMiddleware
  ),
  createMessage
);

export default router;
