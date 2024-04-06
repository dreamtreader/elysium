import { updateMessage } from "../../middleware/updateMessage.js";

export class changeMessage {
  name = "messageChanged";

  trigger = async (io, socket, payload) => {
    const { content, pinned } = payload;
    const locals = {};
    locals.user = socket.data.user;
    locals.message = await updateMessage(payload, false);

    if (locals.user._id.toString() !== locals.message.authorId.toString())
      throw Error("You are not the author of this message");

    locals.message.set({
      ...(content && { content: content }),
      ...(pinned !== undefined && { pinned: pinned }),
    });
    await locals.message.save();

    io.to(locals.message.channelId.toString()).emit(this.name, locals.message);
  };
}
