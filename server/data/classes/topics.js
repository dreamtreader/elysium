import { Topic, Channel } from "../models/index.js";

export class Topics {
  create = async (options) => {
    if (!options.serverId) throw "Server ID is required";
    return await Topic.create({
      ...options,
      position: await Topic.countDocuments({ serverId: options.serverId }),
    });
  };
  getById = async (id, lean = true) => {
    if (!id) throw "Topic ID is required";
    if (lean) return await Topic.findById(id).exec();
    else return await Topic.findById(id).exec();
  };
  getServerTopics = async (serverId, select, lean = true) => {
    if (!serverId) throw TypeError("Server ID is required");
    if (lean) {
      if (select) {
        return await Topic.find({ serverId: serverId })
          .select(select)
          .lean()
          .exec();
      } else {
        return await Topic.find({ serverId: serverId }).lean().exec();
      }
    } else {
      if (select) {
        return await Topic.find({ serverId: serverId }).select(select).exec();
      } else {
        return await Topic.find({ serverId: serverId }).exec();
      }
    }
  };
  deleteServerTopics = async (serverId) => {
    return await Topic.deleteMany({ serverId: serverId }).exec();
  };
  remove = async (topicId) => {
    return Promise.All[
      (await Topic.findByIdAndDelete(topicId),
      await Channel.deleteMany({ topicId: topicId }))
    ];
  };
}
