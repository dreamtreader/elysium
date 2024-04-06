import { classes } from "../classInitializer.js";

const posts = classes.Posts;

export const updatePostMiddleware =
  (lean = true) =>
  async (req, res, next) => {
    const { postId } = req.params;

    const post = await posts.getById(postId, lean);
    if (!post) return next(`Post of ID ${postId} not found`);

    res.locals.post = post;
    return next();
  };
