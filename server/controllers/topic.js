import mongoose from "mongoose";
import { classes } from "../data/classInitializer.js";
import { serialize, editorToRawText } from "../slate/serialization.js";

import cloudinary from "cloudinary";
import Post from "../data/models/post.js";

const posts = classes.Posts;

export const getTopicPosts = async (req, res) => {
  const { topicId } = req.params;
  const { lastPostSortVal, sortField, input } = req.query;

  try {
    const topicPosts = await posts.getByTopicId({
      topicId: topicId,
      ...(lastPostSortVal && { lastPostSortVal: lastPostSortVal }),
      sortField: sortField,
      ...(input && { input: input }),
    });
    res.status(201).json(topicPosts);
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await posts.getById(postId);
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const deletePost = async (req, res) => {
  const post = res.locals.post;

  try {
    await post.deleteOne();
    res.status(200).json({ message: `Successfully deleted post` });
  } catch (err) {
    res.status(409).json({ message: err });
  }
};

export const editPost = async (req, res) => {
  const { serverId, topicId } = req.params;
  const { title, content, banner, tags } = req.body;

  const server = res.locals.server;
  const topic = res.locals.topic;
  const user = res.locals.user;
  const post = res.locals.post;

  const rawText = editorToRawText(content);

  if (rawText.length > 20000)
    throw Error(
      "You may not include more than 20k characters in a single post"
    );

  const attachments = content.children
    .map((node, index) => ({ ...node, index: index }))
    .filter((node) => node.type == "image");

  if (attachments.length >= 20)
    throw Error(
      "You may not include more than 20 attachments in a single post"
    );

  const description = rawText.slice(0, 200);

  if (title && title != post.title) post.title = title;
  if (tags && tags != post.tags) post.tags = Array.from(new Set(tags));
  if (description && description != post.description)
    post.description = description;

  if (banner && banner != post.banner) {
    cloudinary.v2.uploader
      .upload(banner, {
        upload_preset: "Elysium",
        folder: `banners/posts`,
        public_id: post._id.toString(),
        transformation: {
          aspect_ratio: 16 / 9,
        },
        tags: `${server._id.toString()}, ${topic._id.toString()}, ${post._id.toString()}, ${user._id.toString()}`,
      })
      .then((upload) => {
        post.banner = upload.secure_url;
      });
  }

  const attachmentPromises = [];
  var newAttachments = [];

  for (var i = 0; i < attachments.length; i++) {
    attachmentPromises.push(
      cloudinary.v2.uploader.upload(attachments[i].url, {
        upload_preset: "Elysium",
        folder: `media/posts/${post._id.toString()}`,
        tags: `${server._id.toString()}, ${topic._id.toString()}, ${post._id.toString()}, ${user._id.toString()}`,
      })
    );
  }

  await Promise.all(attachmentPromises).then((results) => {
    for (var i = 0; i < results.length; i++) {
      newAttachments.push(results[i].secure_url);
      content.children[attachments[i].index].url = results[i].secure_url;
    }
  });

  post.attachments = newAttachments;
  post.content = serialize(content);

  await post.save();
};
export const createTopicPost = async (req, res) => {
  const { serverId, topicId } = req.params;
  const { title, content, banner, tags } = req.body;

  const server = res.locals.server;
  const topic = res.locals.topic;
  const user = res.locals.user;

  const rawText = editorToRawText(content);

  if (rawText.length > 20000)
    throw Error(
      "You may not include more than 20k characters in a single post"
    );

  const attachments = content.children
    .map((node, index) => ({ ...node, index: index }))
    .filter((node) => node.type == "image");

  if (attachments.length >= 20)
    throw Error(
      "You may not include more than 20 attachments in a single post"
    );

  const description = rawText.slice(0, 200);

  const post = await posts.create({
    title: title,
    serverId: serverId,
    topicId: topicId,
    description: description,
    authorId: user._id,
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
        tags: `${server._id.toString()}, ${topic._id.toString()}, ${post._id.toString()}, ${user._id.toString()}`,
      })
      .then((upload) => {
        post.banner = upload.secure_url;
      });

  const attachmentPromises = [];
  var newAttachments = [];

  for (var i = 0; i < attachments.length; i++) {
    attachmentPromises.push(
      cloudinary.v2.uploader.upload(attachments[i].url, {
        upload_preset: "Elysium",
        folder: `media/posts/${post._id.toString()}`,
        tags: `${server._id.toString()}, ${topic._id.toString()}, ${post._id.toString()}, ${user._id.toString()}`,
      })
    );
  }

  await Promise.all(attachmentPromises).then((results) => {
    for (var i = 0; i < results.length; i++) {
      newAttachments.push(results[i].secure_url);
      content.children[attachments[i].index].url = results[i].secure_url;
    }
  });

  post.attachments = newAttachments;
  post.content = serialize(content);

  await post.save();

  return res.status(201).json({ post: post });
};
