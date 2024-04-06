import { removeImagesByTag } from "../../../cloudinary/removeImages.js";
import { updateMessage } from "../../middleware/updateMessage.js";

export class removeMessage {
  name = "messageRemoved";

  trigger = async (io, socket, payload) => {
    const locals = {};
    locals.user = socket.data.user;
    locals.message = await updateMessage(payload, false);

    const channelId = locals.message.channelId.toString();
    const id = locals.message._id.toString();

    if (locals.user._id.toString() !== locals.message.authorId.toString())
      throw Error("You are not the author of this message");

    await locals.message.deleteOne();
    removeImagesByTag(id);

    io.to(channelId).emit(this.name, { channelId: channelId, _id: id });
  };
}
