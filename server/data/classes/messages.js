import { Message } from "../models/index.js";

export class Messages {
  getById = async (id, lean = true) => {
    if (!id) throw "Message ID not found";
    if (lean) return await Message.findById(id).lean().exec();
    else return await Message.findById(id).exec();
  };
  getPinned = async (channelId) => {
    if (!channelId) throw TypeError("Channel ID is required");
    return Message.find({ channelId: channelId, pinned: true }).lean().exec();
  };

  getByChannelId = async (channelId, before) => {
    if (!channelId) throw "Channel ID not found";

    return await Message.find({
      channelId: channelId,
      ...(before && { createdAt: { $lt: before } }),
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();
  };
  getWithFilter = async (options) => {
    const result = await Message.paginate(
      {
        ...(options.userId && { authorId: options.userId }),
        ...(options.input && {
          content: { $regex: new RegExp(options.input) },
        }),
        ...(options.channelId
          ? { channelId: options.channelId }
          : options.channelIds
          ? {
              channelId: { $in: options.channelIds },
            }
          : null),

        ...((options.after || options.before) && {
          createdAt: {
            ...(options.after && {
              $gte: options.after,
            }),
            ...(options.before && { $lte: options.before }),
          },
        }),
        ...(options.pinned && { pinned: options.pinned }),
      },
      {
        sort: { createdAt: -1 },
        page: options.page ?? 1,
        lean: true,
        limit: options.limit || 10,
      }
    );
    return { messages: result.docs, count: result.totalDocs };
  };
  deleteChannelMessages = async (channelId) => {
    if (!channelId) throw "Channel ID not found";
    return await Message.deleteMany({ channelId: channelId }).exec();
  };
  create = async ({ content, ...options }) => {
    return await Message.create({
      content: content,
      ...options,
    });
  };
}
