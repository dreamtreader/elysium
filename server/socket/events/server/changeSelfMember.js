import { updateServer } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import cloudinary from "cloudinary";
const roles = classes.Roles;
export class changeSelfMember {
  name = "selfMemberChanged";

  trigger = async (io, socket, payload) => {
    const { displayName, avatar, banner, serverId } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[payload.serverId];

    const allowed =
      roles.isAbleTo("MANAGE_DISPLAYNAME", locals.selfMember) ||
      roles.isAbleTo("CHANGE_DISPLAYNAME", locals.selfMember) ||
      locals.selfMember.userId.toString() ===
        locals.server.ownerId.toString() ||
      displayName === locals.selfMember.displayName;

    if (!allowed) throw Error("You're not allowed to change your nickname");

    const attachmentPromises = [];
    if (avatar && avatar !== locals.selfMember.avatar) {
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(avatar, {
            upload_preset: "elysium",
            folder: `avatars/members`,
            public_id: locals.selfMember._id.toString(),
            tags: `${serverId}, ${locals.selfMember._id.toString()}`,
          })
          .then((result) => ({ url: result.secure_url, field: "avatar" }))
      );
    }
    if (banner && banner !== locals.selfMember.banner) {
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(banner, {
            upload_preset: "elysium",
            folder: `banners/members`,
            public_id: locals.selfMember._id.toString(),
            tags: `${serverId}, ${locals.selfMember._id.toString()}`,
          })
          .then((result) => ({ url: result.secure_url, field: "banner" }))
      );
    }
    await Promise.all(attachmentPromises)
      .then((results) => {
        results.forEach((result) => {
          locals.server[result.field] = result.url;
        });
      })
      .catch((err) => console.log(err));

    if (displayName !== locals.selfMember.displayName)
      locals.selfMember.displayName = displayName;
    await locals.selfMember.save();

    socket.data.members[payload.serverId] = locals.selfMember;

    io.to(locals.server._id.toString()).emit(
      "memberChanged",
      locals.selfMember
    );
  };
}
