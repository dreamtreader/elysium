import { classes } from "../data/classInitializer.js";
import { CHANNEL_IDS } from "../types/index.js";
const channels = classes.Channels;
const messages = classes.Messages;
const users = classes.Users;

export const getChannel = async (req, res) => {
  const { id } = req.params;
  try {
    const channel = await channels.getById(id);
    if (!channel) return res.status(401).json({ message: "Channel not found" });
    return res.status(200).json(channel);
  } catch (err) {
    return res.status(401).json({ message: err });
  }
};

export const editChannel = async (req, res) => {
  try {
    const channelInfo = req.body;
    delete channelInfo._id;
    const channel = getChannel(req, res);
    channel = { ...channel, ...req.body };
    await channel.save();
    res.status(201).json(channel);
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

export const createChannel = async (req, res) => {
  const server = res.locals.server;
  const topic = res.locals.topic;
  const body = req.body;
  try {
    const channel = await channels.create({
      ...body,
      serverId: server._id,
      topicId: topic._id,
    });
    res.status(201).json(channel);
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const deleteChannel = async (req, res) => {
  const channel = res.locals.channel;
  try {
    await channels.delete(channel);
  } catch (err) {
    res.status(401).json({ message: "Failed to delete channel." });
  }
};

export const modifyChannelPositions = async (req, res) => {
  const { position } = req.params;
  const channel = res.locals.channel;
  try {
    channel.position = position;
    await channel.save();
  } catch (err) {
    res.status(400).json({ message: "Failed to modify channel position" });
  }
};

export const getChannelMessages = async (req, res) => {
  const { channelId } = req.params;
  const { before } = req.query;
  try {
    const channelMessages = await messages.getByChannelId(channelId, before);
    res.status(201).json(channelMessages);
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const getPinnedMessages = async (req, res) => {
  const { channelId } = req.params;
  try {
    const pinnedMessages = await channels.getPinned(channelId);
    res.status(201).json(pinnedMessages);
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const pinMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await messages.getById(messageId);
    message.pinned = true;
    await message.save();
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

export const unpinMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await messages.getById(messageId);
    message.pinned = false;
    await message.save();
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

export const getMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await messages.getById(messageId);
    res.status(200).json(message);
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

export const createMessage = async (req, res) => {
  const channelId = res.locals.channel._id;
  const userId = res.locals.user._id;
  const body = req.body;
  try {
    const message = await messages.create({
      content: body.content,
      ...{ ...body, channelId: channelId, authorId: userId },
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  try {
    const message = await messages.getById(messageId);
    message.deleted = true;
    await message.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

export const addGroupDMRecipient = async (req, res) => {
  try {
    const channel = res.locals.channel;
    const user = res.locals.user;

    const index = channel.recipients.findIndex(
      (recipient) => recipient._id === user._id
    );
    if (index)
      return res.status(401).json({ message: "User is already in group DM" });

    channel.recipients.push({ _id: user._id });
    const message = await messages.create({
      content: `${user.displayName} has joined the group DM.`,
      channelId: channel._id,
      system: true,
    });
    await channel.save();
    await message.save();
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

export const removeGroupDMRecipient = async (req, res) => {
  try {
    const channel = res.locals.channel;
    const user = res.locals.user;
    const index = channel.recipients.findIndex(
      (recipient) => recipient._id === user._id
    );
    if (!index)
      return res.status(401).json({ message: "User was never in group DM" });
    channel.recipients.splice(index, 1);
    await channel.save();
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

export const getFilteredChannelMessages = async (req, res) => {
  const channel = res.locals.channel;
  const { channelId } = req.params;
  const { from, before, after, pinned, page, input } = req.query;

  if (channel.type !== CHANNEL_IDS.DM && channel.type !== CHANNEL_IDS.GROUP_DM)
    res
      .status(400)
      .json({ message: "You may only use this endpoint for DMs or group DMs" });

  if (!channelId) res.status(400).json({ message: "Channel ID is required" });
  const fetchedMessages = await messages.getWithFilter({
    channelId: channelId,
    ...(from && { userId: from }),
    ...(before && { before: before }),
    ...(after && { after: after }),
    ...(input && { input: input }),
    ...(pinned !== undefined && { pinned: pinned }),
    page: page || 1,
  });

  res.status(201).json({
    messages: fetchedMessages.messages,
    count: fetchedMessages.count,
  });
};
