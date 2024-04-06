import { updatePost, updateServer } from "../../middleware/index.js";
import { hasPermission } from "../../middleware/hasPermission.js";
import { removeImagesByTag } from "../../../cloudinary/removeImages.js";

export class removePost {
  name = "postRemoved";

  trigger = async (io, socket, payload) => {
    const { serverId } = payload;

    const locals = {};

    locals.user = socket.data.user;
    locals.server = await updateServer(payload);
    locals.selfMember = socket.data.members[serverId];

    locals.post = await updatePost(payload, false);
    locals.hasPerm = hasPermission("ADMINISTRATOR")(locals, false, false);

    if (
      locals.user._id.toString() !== locals.post.authorId.toString() &&
      !locals.hasPerm &&
      locals.user._id.toString() !== locals.server.ownerId.toString()
    )
      throw Error("You are not the author of this post");

    removeImagesByTag(locals.post._id.toString());

    await post.deleteOne();

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
