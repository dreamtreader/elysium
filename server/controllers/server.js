import { classes } from "../data/classInitializer.js";
import cloudinary from "cloudinary";

const servers = classes.Servers;
const channels = classes.Channels;
const topics = classes.Topics;
const members = classes.Members;
const users = classes.Users;
const roles = classes.Roles;
const messages = classes.Messages;

export const createServer = async (req, res) => {
  const user = res.locals.user;
  const { avatar } = req.body;
  try {
    const server = await servers.create({
      ...req.body,
      ownerId: user._id,
    });
    if (avatar) {
      await cloudinary.v2.uploader
        .upload(avatar, {
          folder: `avatars/servers`,
          public_id: server._id.toString(),
          tags: `${server._id.toString()}`,
        })
        .then((result) => (server.avatar = result.secure_url));
      await server.save();
    }
    const member = await members.create({
      userId: server.ownerId,
      serverId: server._id,
    });
    const role = await roles.create(
      {
        name: "@everyone",
        serverId: server._id,
        position: 0,
      },
      true
    );
    const topic = await topics.create({
      name: "General",
      serverId: server._id,
      position: 0,
    });

    const channel = await channels.create({
      name: "main",
      serverId: server._id,
      topicId: topic._id,
      position: 0,
    });

    res.status(201).json({
      server: server,
      member: member,
      channel: channel,
      topic: topic,
      role: role,
    });
  } catch (err) {
    console.log(err);
    res.status(409).json({ message: err });
  }
};

export const getServer = async (req, res) => {
  const server = res.locals.server;
  res.status(204).json(server);
};

export const modifyServer = async (req, res) => {
  const { name, avatar, banner } = req.params;
  const server = res.locals.server;
  try {
    name ? (server.name = name) : null;
    avatar ? (server.avatar = avatar) : null;
    banner ? (server.banner = banner) : null;
    await server.save();
    res.status(201).json(server);
  } catch (err) {
    res.status(401).json({ message: "Failed to modify server" });
  }
};

export const deleteServer = async (req, res) => {
  const server = res.locals.server;
  try {
    server.remove();
    res.status(204).json({});
  } catch (err) {
    return res.status(400).json({ message: "Failed to delete server" });
  }
};

export const addServerMember = async (req, res) => {
  const user = res.locals.user;
  const server = res.locals.server;

  try {
    const alreadyJoined = members.getByUserId(user._id, server._id);
    if (alreadyJoined)
      return res
        .status(401)
        .json({ message: "You are already in this server" });

    const member = members.create({ userId: user._id, serverId: server._id });
    res.status(201).json({ member: member, server: server });
  } catch (err) {
    res.status(400).json({ message: "Failed to join server" });
  }
};

export const modifyServerMember = async (req, res) => {
  const member = res.locals.member;
  const { displayName, roleIds } = req.body;

  try {
    displayName ? (member.displayName = displayName) : null;
    roleIds ? (member.roleIds = roleIds) : null;
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(401).json({ message: "Failed to modify member" });
  }
};

export const modifyCurrentMember = async (req, res) => {
  const { displayName } = req.body;

  const user = res.locals.user;
  const server = res.locals.server;

  try {
    const member = members.getByUserId(user._id, server._id);

    displayName ? (member.displayName = displayName) : null;

    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(401).json({ message: "Failed to modify member" });
  }
};

export const getServerMembers = async (req, res) => {
  const { serverId } = req.params;
  if (!serverId) res.status(400).json({ message: "Server ID isn't provided" });
  try {
    const serverMembers = await members.getServerMembers(serverId);
    const serverUsers = [];
    for (const member of serverMembers) {
      const user = await users.getSafely(member.userId);
      serverUsers.push(user);
    }
    res.status(200).json({ members: serverMembers, users: serverUsers });
  } catch (err) {
    res.status(400).json({ message: err });
  }
};

export const getSearchRecommendations = async (req, res) => {
  const { serverId } = req.params;

  if (req.query.q) {
    try {
      const membersByNameOrUsername = await members.getFiltered(
        serverId,
        req.query.q
      );
      res.status(200).json(membersByNameOrUsername);
    } catch (err) {
      return res.status(400).json({ message: err });
    }
  }
};

export const getFilteredServerMessages = async (req, res) => {
  const { serverId } = req.params;
  const { channelId, from, before, after, pinned, page, input } = req.query;

  var channelIds = [];

  channelIds = await channels.getServerChannels(serverId, ["_id"]);

  channelIds = channelIds.map((channel) => channel._id.toString());

  const fetchedMessages = await messages.getWithFilter({
    channelIds: channelIds,
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
