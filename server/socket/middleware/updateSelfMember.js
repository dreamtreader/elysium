import { classes } from "../../data/classInitializer.js";
const members = classes.Members;

export const updateSelfMember = async (locals, payload, lean = true) => {
  const { user, server } = locals;
  const { serverId } = payload;
  const id = server?._id !== undefined ? server._id : serverId;
  const member = await members.getByUserId(user._id, id, lean);
  if (!member) throw Error("Self member was not found");
  return member;
};
