import express from "express";
import {
  updateUserMiddleware,
  authorizationMiddleware,
  updateServerMiddleware,
  updateTopicMiddleware,
  permissionMiddleware,
  updatePostMiddleware,
  contextualMiddleware,
} from "../data/middleware/index.js";
import {
  createServer,
  getServerMembers,
  getSearchRecommendations,
  createChannel,
  getFilteredServerMessages,
} from "../controllers/index.js";
import {
  createTopicPost,
  deletePost,
  getPost,
  getTopicPosts,
} from "../controllers/topic.js";

const router = express.Router();

router.post(
  "/create",
  updateUserMiddleware(),
  authorizationMiddleware,
  createServer
);

router.post(
  "/:serverId/:topicId/channels",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  updateTopicMiddleware,
  permissionMiddleware("MANAGE_CHANNEL", false, true),
  createChannel
);

router.get(
  "/:serverId/:topicId/posts",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  updateTopicMiddleware,
  permissionMiddleware("VIEW_POST", false, true),
  getTopicPosts
);
router.post(
  "/:serverId/:topicId/posts",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  updateTopicMiddleware,
  permissionMiddleware("CREATE_POST", false, true),
  createTopicPost
);

router.get(
  "/:serverId/:topicId/posts/:postId",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  updateTopicMiddleware,
  permissionMiddleware("VIEW_POST", false, true),
  getPost
);

router.get(
  "/:serverId/:topicId/posts/:postId/delete",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  updateTopicMiddleware,
  updatePostMiddleware(false),
  contextualMiddleware(
    (local) => local.post.authorId == local.user._id,
    permissionMiddleware("ADMINISTRATOR", false, false)
  ),
  deletePost
);

router.get(
  "/:serverId/members",
  updateUserMiddleware(),
  authorizationMiddleware,
  getServerMembers
);

router.get(
  "/:serverId/messages",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  getFilteredServerMessages
);

router.get(
  "/:serverId/members/search",
  updateUserMiddleware(),
  authorizationMiddleware,
  updateServerMiddleware(),
  getSearchRecommendations
);

export default router;
