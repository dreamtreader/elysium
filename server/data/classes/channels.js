import { Channel } from "../models/index.js";
import { CHANNEL_IDS } from "../../types/index.js";

import { Messages } from "./messages.js";
const messages = new Messages();

export class Channels {
  getById = async (id, lean = true) => {
    if (!id) throw Error("Channel ID is required");
    if (lean) return Channel.findById(id).lean().exec();
    else return Channel.findById(id).lean(false).exec();
  };
  getByPosition = async (position, topicId, lean = true) => {
    if (topicId === undefined || position === undefined)
      throw Error("Topic ID and position are required");
    return Channel.findOne({ position: position, topicId: topicId })
      .lean(lean)
      .exec();
  };
  getServerChannels = async (serverId, select, lean = true) => {
    if (!serverId) throw Error("Server ID is required");
    if (lean) {
      if (select)
        return await Channel.find({ serverId: serverId })
          .select(select)
          .lean()
          .exec();
      else return await Channel.find({ serverId: serverId }).lean().exec();
    } else {
      if (select)
        return await Channel.find({ serverId: serverId }).select(select).exec();
      else return await Channel.find({ serverId: serverId }).exec();
    }
  };
  getTopicChannels = async (topicId, select, lean = true) => {
    if (!topicId) throw Error("Topic ID is required");
    if (lean) {
      if (select) {
        return await Channel.find({ topicId: topicId })
          .select(select)
          .lean()
          .exec();
      } else {
        return await Channel.find({ topicId: topicId }).lean().exec();
      }
    } else {
      if (select) {
        return await Channel.find({ topicId: topicId }).select(select).exec();
      } else {
        return await Channel.find({ topicId: topicId }).exec();
      }
    }
  };

  create = async (options) => {
    if (!options.serverId || !options.topicId)
      throw Error("Server ID and Topic ID are required");
    return await Channel.create({
      ...options,
      name: options.name || "New Channel",
      position: await Channel.countDocuments({
        topicId: options.topicId,
      }),
      permissionOverwrites: [],
    });
  };
  createDM = async (options) => {
    if (!options.recipients) throw Error("Recipients are required");
    if (options.recipients.length !== 2)
      throw Error("A direct message must have 2 recipients");
    return await Channel.create({
      ...options,
    });
  };
  getUserDMs = async (userId, select) => {
    if (!userId) throw "User ID is required";
    if (select)
      return await Channel.find({ recipients: userId }).select(select);
    else return await Channel.find({ recipients: userId });
  };
  incrementChannelPositions = async (options) => {
    return await Channel.updateMany(options, { $inc: { position: 1 } }).exec();
  };
  decrementChannelPositions = async (options) => {
    return await Channel.updateMany(options, { $dec: { position: 1 } }).exec();
  };
  delete = async (channel) => {
    if (channel.type === CHANNEL_IDS.TEXT) {
      await messages.deleteChannelMessages(channel._id);
    }
    return await channel.deleteOne();
  };
}
