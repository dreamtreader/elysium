import { Member } from "../models/index.js";

export class Members {
  getByUserId = async (userId, serverId, lean = true) => {
    if (lean)
      return await Member.findOne({ userId: userId, serverId: serverId })
        .lean()
        .exec();
    else
      return await Member.findOne({
        userId: userId,
        serverId: serverId,
      }).exec();
  };
  getMultipleByUserId = async (userId, select = [], lean = true) => {
    if (lean)
      if (select.length)
        return await Member.find({ userId: userId })
          .select(select)
          .lean()
          .exec();
      else return await Member.find({ userId: userId }).lean().exec();
    else if (select.length)
      return await Member.find({
        userId: userId,
      })
        .select(select)
        .exec();
    else return await Member.find({ userId: userId }).exec();
  };
  getById = async (id, lean = true) => {
    if (lean) return await Member.findById(id).lean().exec();
    else return await Member.findById(id).exec();
  };
  getServerMembers = async (serverId, options) => {
    return await Member.find({ serverId: serverId }).limit(10).lean().exec();
  };

  getMemberCount = async (serverId) => {
    return await Member.countDocuments({ serverId: serverId }).exec();
  };

  create = async (options) => {
    return await Member.create(options);
  };

  editMember = async (member, options) => {
    for (const [field, value] of Object.entries(options)) {
      member[field] = value;
    }
    await member.save();
  };
  removeMember = async (memberId) => {
    if (!memberId) throw Error("Member ID not found");
    await memberId.findByIdAndDelete(memberId);
  };

  addRole = async (member, role) => {
    if (!role) throw Error("Role is required");
    const roles = new Set(member.roleIds);
    roles.add(role._id.toString());
    member.roleIds = [...roles];
    await member.save();
  };

  removeRole = async (member, roleId) => {
    if (!roleId) throw Error("Role ID is required");
    const index = member.roleIds.findIndex(
      (roleId) => roleId.toString() === roleId
    );
    if (!index) throw Error(`Member does not own role ${roleId}`);
    member.roleIds.splice(index, 1);
    await member.save();
  };

  removeRoleFromAllMembers = async (role) => {
    if (!role) throw Error("Role is required");
    const members = await Member.find({ roleIds: role._id }).exec();
    const promises = [];
    members.forEach((member) =>
      promises.push(this.removeRole(member, role._id))
    );
    await Promise.all(promises);
  };

  getFiltered = async (serverId, input) => {
    const firstBatch = await Member.find({
      serverId: serverId,
      displayName: { $regex: "^" + input, $options: "i" },
    })
      .limit(5)
      .lean()
      .exec();

    const members = new Set(firstBatch);

    const secondBatch = await Member.find({ serverId: serverId })
      .populate("userId", null, {
        $or: [
          { username: { $regex: "^" + input, $options: "i" } },
          { displayName: { $regex: "^" + input, $options: "i" } },
        ],
      })
      .limit(5)
      .lean()
      .exec();

    secondBatch.forEach((member) => {
      member.userId = member.userId._id;
      members.add(member);
    });
    return Array.from(members);
  };

  delete = async (memberId) => {
    if (!memberId) throw Error("Member ID is required");
    return await Member.findByIdAndDelete(memberId).exec();
  };
}

/*[
  "-email",
  "-password",
  "-ignored",
  "-premiumExpiresAt",
  "-verified",
  "-",
  "-lastReadMessages",
  "-friends",
  "-friendRequests",
]*/
