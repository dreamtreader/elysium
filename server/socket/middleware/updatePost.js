import { classes } from "../../data/classInitializer.js";

const posts = classes.Posts;

export const updatePost = async (payload, lean = true) => {
  const { postId } = payload;
  if (!postId) throw Error("Post ID not found");
  const post = await posts.getById(postId, lean);
  if (!post) throw Error("Post was not found");
  return post;
};
