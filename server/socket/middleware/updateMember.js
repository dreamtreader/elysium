import { classes } from "../../data/classInitializer.js";

const members = classes.Members;

export const updateMember = async (payload, lean = true) => {
  const { memberId } = payload;
  if (!memberId) throw Error("Member ID not found");
  const member = await members.getById(memberId, lean);
  if (!member) throw Error("Member was not found");
  return member;
};
