import { Post } from "../models/index.js";

export class Posts {
  getById = async (id, lean = true) => {
    if (!id) throw TypeError("Post ID is required");
    if (lean) return Post.findById(id).lean().exec();
    else return Post.findById(id).lean(false).exec();
  };

  getByTopicId = async (options) => {
    if (!options.topicId) throw Error("Topic ID is required");
    return await Post.find({
      topicId: options.topicId,
      ...(options.input && {
        $or: [
          { title: { $regex: new RegExp(options.input) } },
          { description: { $regex: new RegExp(options.input) } },
          { tags: { $regex: new RegExp(options.input) } },
        ],
      }),
      ...(options.lastPostSortVal && {
        [options.sortField || "createdAt"]: { $lt: options.lastPostSortVal },
      }),
    })
      .select("-content")
      .sort({ [options.sortField || "createdAt"]: -1 })
      .limit(5)
      .populate("authorId", [
        "displayName",
        "username",
        "friends",
        "createdAt",
        "isOnline",
        "status",
        "banner",
      ])
      .lean()
      .exec();
  };

  create = async (options) => {
    if (!options.serverId || !options.topicId)
      throw Error("Server ID and Topic ID are required");
    if (!options.authorId) throw Error("Author ID is required");
    if (!options.title) throw Error("Title is required");

    return await Post.create({
      ...options,
    });
  };
  delete = async (post) => {
    return await post.deleteOne();
  };
}
