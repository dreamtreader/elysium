import { classes } from "../../../data/classInitializer.js";
import roomHandler from "../../handleRooms.js";
import { updateInvite } from "../../middleware/updateInvite.js";
import mongoose from "mongoose";
const members = classes.Members;

export class addMember {
  name = "serverJoined";

  trigger = async (io, socket, payload) => {
    const locals = {};

    locals.user = socket.data.user;
    locals.invite = await updateInvite(payload, false, true);
    locals.server = locals.invite.serverId;

    const memberCount = await members.getMemberCount(
      locals.server._id.toString()
    );

    const member = socket.data.members[locals.server._id.toString()];
    if (memberCount >= 100000) throw Error("Server is currently full");
    if (member) throw Error("You are already in this server");

    const newMember = await members.create({
      userId: locals.user._id,
      serverId: locals.server._id,
    });

    locals.invite.uses = locals.invite.uses + 1;

    if (locals.invite.maxUses && locals.invite.uses === locals.invite.maxUses) {
      await locals.invite.deleteOne();
      io.in(locals.server._id.toString()).emit(
        "inviteRemoved",
        locals.invite._id
      );
    } else
      io.in(locals.server._id.toString()).emit("inviteChanged", locals.invite);

    socket.data.members[locals.server._id.toString()] = newMember;

    socket.emit("serverAdded", locals.server);
    roomHandler.joinServerRooms(socket, locals.server, newMember);

    io.to(locals.server._id.toString()).emit("memberAdded", newMember);
  };
}
