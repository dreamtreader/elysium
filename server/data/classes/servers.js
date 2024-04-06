import {
  Server,
  Member,
  Channel,
  Topic,
  Role,
  Message,
  Invite,
  Post,
} from "../models/index.js";
export class Servers {
  getById = async (id, lean = true) => {
    if (!id) throw Error("Server ID is required");
    return await Server.findById(id).lean(lean).exec();
  };
  getMultipleById = async (ids, select, lean = true) => {
    if (!ids) throw Error("Server IDs are required");
    if (lean) {
      if (select)
        return await Server.find()
          .where("_id")
          .in(ids)
          .select(select)
          .lean()
          .exec();
      else return await Server.find().where("_id").in(ids).lean().exec();
    } else {
      if (select)
        return await Server.find().where("_id").in(ids).select(select).exec();
      else return await Server.find().where("_id").in(ids).exec();
    }
  };
  create = async (options) => {
    return await Server.create({
      ...options,
      name: options.name || "New Server",
    });
  };
  delete = async (id, channelIds, topicIds) => {
    return await Promise.all([
      Invite.deleteMany({ serverId: id }),
      Topic.deleteMany({ serverId: id }),
      Channel.deleteMany({ serverId: id }),
      Member.deleteMany({ serverId: id }),
      Role.deleteMany({ serverId: id }),
    ]);
  };
}
