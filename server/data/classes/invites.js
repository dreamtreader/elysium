import { Invite } from "../models/index.js";
import mongoose from "mongoose";
export class Invites {
  create = async (options) => {
    if (!options.serverId || !options.authorId)
      throw Error("Server and Author ID are required");
    return await Invite.create(options);
  };
  getById = async (id, lean = true, populate = false) => {
    if (!mongoose.Types.ObjectId.isValid(id)) throw Error("Invalid Invite ID");

    if (populate)
      return await Invite.findById(id).lean(lean).populate("serverId").exec();
    else return await Invite.findById(id).lean(lean).exec();
  };
  getServerInvites = async (serverId, lean = true) => {
    if (lean) return await Invite.find({ serverId: serverId }).lean().exec();
    else return await Invite.find({ serverId: serverId }).exec();
  };

  delete = async (id) => {
    if (!id) throw Error("Invite ID is required");
    return await Invite.findByIdAndDelete(id).exec();
  };
}
