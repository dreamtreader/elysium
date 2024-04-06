import { updatePost, updateServer } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { hasPermission } from "../../middleware/hasPermission.js";
import cloudinary from "cloudinary";
import { editorToRawText, serialize } from "../../../slate/serialization.js";
import { removeImagesByTag } from "../../../cloudinary/removeImages.js";

const posts = classes.Posts;
export class changePost {
  name = "postChanged";

  trigger = async (io, socket, payload) => {
    const { serverId, title, content, banner, tags } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer();
    locals.selfMember = socket.data.members[serverId];

    locals.post = await updatePost(payload, false);
    locals.hasPerm = hasPermission("ADMINISTRATOR")(locals, false, false);

    if (
      locals.user._id.toString() !== locals.post.authorId.toString() &&
      !locals.hasPerm &&
      locals.user._id.toString() !== locals.server.ownerId.toString()
    )
      throw Error("You are not the author of this post");

    const rawText = editorToRawText(content);
    if (rawText.length > 20000)
      throw Error(
        "You may not include more than 20k characters in a single post"
      );

    const attachments = content.children
      .filter((children) => children.type == "image")
      .map((image) => image.url);

    if (attachments.length >= 20)
      throw Error(
        "You may not include more than 20 attachments in a single post"
      );

    const serializedContent = serialize(content);

    title ? (locals.post.title = title) : null;
    tags ? (locals.post.tags = tags) : null;
    content ? (locals.post.content = serializedContent) : null;

    banner
      ? cloudinary.v2.uploader
          .upload(banner, {
            upload_preset: "Elysium",
            folder: `banners/posts`,
            public_id: locals.post._id.toString(),
            transformation: {
              aspect_ratio: 16 / 9,
            },
            tags: `${locals.server._id.toString()}, ${locals.topic._id.toString()}, ${locals.post._id.toString()}, ${locals.user._id.toString()}`,
          })
          .then((upload) => {
            post.banner = upload.secure_url;
          })
      : null;

    const attachmentPromises = [];
    const newAttachments = [];

    for (i = 0; i < attachments.length; i++) {
      attachmentPromises.push(
        cloudinary.v2.uploader
          .upload(attachments[i], {
            upload_preset: "Elysium",
            folder: `media/posts/${post._id.toString()}`,
            tags: `${locals.server._id.toString()}, ${locals.topic._id.toString()}, ${locals.post._id.toString()}, ${locals.user._id.toString()}`,
          })
          .then((upload) => {
            post.content.replace(attachments[i], upload.secure_url);
            newAttachments.push(upload.secure_url);
          })
      );
    }

    await Promise.all(attachmentPromises);

    removeImagesByTag(locals.post._id.toString());

    post.attachments = newAttachments;

    await post.save();

    const sockets = await io.in(post.topicId.toString()).fetchSockets();

    sockets.forEach(async (socket) => {
      locals.user = socket.data.user;
      locals.selfMember = socket.data.members[serverId];
      const hasPermTopic = hasPermission("VIEW_POST")(locals, false, true);
      if (hasPermTopic) {
        socket.emit(this.name, post);
      }
    });
  };
}
