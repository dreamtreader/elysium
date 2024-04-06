import { classes } from "../../data/classInitializer.js";

const invites = classes.Invites;

export const updateInvite = async (payload, lean = true, populate = false) => {
  const { inviteId } = payload;
  if (!inviteId) throw Error("Invite ID not found");
  const invite = await invites.getById(inviteId, lean, populate);
  if (!invite) throw Error("Invite was not found");
  return invite;
};
