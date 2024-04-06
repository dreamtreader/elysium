import { updateServer, updateTopic } from "../../middleware/index.js";
import { classes } from "../../../data/classInitializer.js";
import { hasPermission } from "../../middleware/hasPermission.js";
import cloudinary from "cloudinary";
import { editorToRawText, serialize } from "../../../slate/serialization.js";

const posts = classes.Posts;
export class addPost {
  name = "postAdded";

  trigger = async (io, socket, payload) => {
    const { serverId, topicId, title, content, banner, tags, attachments } =
      payload;
    const locals = {};

    locals.user = socket.data.user;
    locals.selfMember = socket.data.members[serverId];

    locals.server = await updateServer(payload);
    locals.topic = await updateTopic(payload);
    locals.hasPerm = hasPermission("CREATE_POST")(locals, false, true);

    if (!locals.hasPerm)
      throw Error(
        "You do not have permissions to create posts with this topic"
      );

    if (!content) throw Error("Content is required");
    if (!content.children) throw Error("Content is not valid");

    const rawText = editorToRawText(content);
    if (rawText.length > 20000)
      throw Error(
        "You may not include more than 20k characters in a single post"
      );

    if (attachments.length >= 20)
      throw Error(
        "You may not include more than 20 attachments in a single post"
      );

    const serializedContent = serialize(content);

    const post = await posts.create({
      title: title,
      serverId: serverId,
      topicId: topicId,
      authorId: locals.user._id,
      tags: Array.from(new Set(tags)),
    });

    if (banner)
      cloudinary.v2.uploader
        .upload(banner, {
          upload_preset: "Elysium",
          folder: `banners/posts`,
          public_id: post._id.toString(),
          transformation: {
            aspect_ratio: 16 / 9,
          },
          tags: `${locals.server._id.toString()}, ${locals.topic._id.toString()}, ${post._id.toString()}, ${locals.user._id.toString()}`,
        })
        .then((upload) => {
          post.banner = upload.secure_url;
        });

    const attachmentPromises = [];
    const newAttachments = [];
    var newContent = serializedContent;

    for (var i = 0; i < attachments.length; i++) {
      attachmentPromises.push(
        cloudinary.v2.uploader.upload(attachments[i], {
          upload_preset: "Elysium",
          folder: `media/posts/${post._id.toString()}`,
          tags: `${locals.server._id.toString()}, ${locals.topic._id.toString()}, ${post._id.toString()}, ${locals.user._id.toString()}`,
        })
      );
    }

    await Promise.all(attachmentPromises).then((results) => {
      for (var i = 0; i < results.length; i++) {
        const postContent = newContent;
        console.log(attachments[i]);
        postContent.replace(attachments[i], results[i].secure_url);
        newContent = postContent;
        newAttachments.push(results[i].secure_url);
      }
    });

    post.attachments = newAttachments;
    post.content = newContent;

    await post.save();

    const sockets = await io.in(post.topicId.toString()).fetchSockets();

    sockets.forEach(async (socket) => {
      locals.user = socket.data.user;
      locals.selfMember = socket.data.members[serverId];
      const hasPermTopic = hasPermission("VIEW_POST")(locals, false, true);
      if (hasPermTopic) {
        socket.emit("postAdded", post);
      }
    });
  };
}
