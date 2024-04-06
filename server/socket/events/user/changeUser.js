import cloudinary from "cloudinary";
export class changeUser {
  name = "userChanged";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    const { avatar, banner } = payload;

    [
      "username",
      "displayName",
      "status",
      "primaryColor",
      "secondaryColor",
    ].forEach((field) => {
      if (payload[field]) locals.user.set({ [field]: payload[field] });
    });

    const attachmentPromises = [];

    if (avatar && avatar !== locals.user.avatar) {
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(avatar, {
            upload_preset: "elysium",
            folder: `avatars/users`,
            public_id: locals.user._id.toString(),
            tags: locals.user._id.toString(),
          })
          .then((result) => ({ url: result.secure_url, field: "avatar" }))
      );
    }
    if (banner && banner !== locals.user.banner) {
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(banner, {
            upload_preset: "elysium",
            folder: `banners/users`,
            public_id: locals.user._id.toString(),
            tags: locals.user._id.toString(),
          })
          .then((result) => ({ url: result.secure_url, field: "banner" }))
      );
    }

    await Promise.all(attachmentPromises)
      .then((results) => {
        results.forEach((result) => {
          locals.user[result.field] = result.url;
        });
      })
      .catch((err) => console.log(err));

    await locals.user.save();
    socket.data.user = locals.user;
    io.in(locals.user._id.toString()).emit(this.name, {
      _id: locals.user._id.toString(),
      displayName: locals.user.displayName,
      username: locals.user.username,
      avatar: locals.user.avatar,
      banner: locals.user.banner,
      status: locals.user.status,
    });
  };
}
