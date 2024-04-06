import mongoose from "mongoose";
import { updateServer, hasPermission } from "../../middleware/index.js";
import cloudinary from "cloudinary";
export class changeServer {
  name = "serverChanged";

  trigger = async (io, socket, payload) => {
    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload, false);
    locals.selfMember = socket.data.members[locals.server._id.toString()];
    const hasPerm = hasPermission("MANAGE_SERVER")(locals);

    if (!hasPerm) return;

    const { avatar, banner, name } = payload;

    const attachmentPromises = [];

    if (avatar && avatar !== locals.server.avatar)
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(avatar, {
            upload_preset: "elysium",
            public_id: `${locals.server._id.toString()}`,
            folder: `avatars/servers`,
            tags: `${locals.server._id.toString()}`,
          })
          .then((result) => ({ url: result.secure_url, field: "avatar" }))
      );

    if (banner && banner !== locals.server.avatar)
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(avatar, {
            upload_preset: "elysium",
            public_id: `${locals.server._id.toString()}`,
            folder: `banners/servers`,
            tags: `${locals.server._id.toString()}`,
          })
          .then((result) => ({ url: result.secure_url, field: "banner" }))
      );

    await Promise.all(attachmentPromises)
      .then((results) => {
        results.forEach((result) => {
          locals.server[result.field] = result.url;
        });
      })
      .catch((err) => console.log(err));

    if (name && name !== locals.server.name) locals.server.set({ name: name });

    await locals.server.save();
    io.to(locals.server._id.toString()).emit(this.name, locals.server);
  };
}
