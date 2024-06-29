const express = require("express");
const router = express.Router();
const { Post, validate } = require("../model/Post");
const { User } = require("../model/User");
const mongoose = require("mongoose");
const { auth, authorized } = require("../middleware/Auth");

const _ = require("lodash");

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Display all posts
router.get("/", async (req, res) => {
  const posts = await Post.find().sort("-createdAt");
  const formattedPosts = posts.map((post) => {
    const formattedPost = _.pick(post, [
      "_id",
      "title",
      "description",
      "imgUrl",
      "createdAt",
    ]);
    formattedPost.createdAt = formatDate(post.createdAt);
    return formattedPost;
  });
  res.send(formattedPosts);
});

// Get there posts only
router.get("/mypost/:userId", auth, async (req, res) => {
  const { userId } = req.params;
  const tokenUserId = req.user._id;

  if (!isValidObjectId(userId)) {
    return res.status(400).send("Invalid user Id");
  }
  if (userId !== tokenUserId.toString()) {
    return res
      .status(403)
      .send("You are not authorized to access posts of another user.");
  }

  const user = await User.findById(userId);
  if (!user) return res.status(404).send("User not found.");

  const posts = await Post.find({ user: userId }).sort("-createdAt");

  const formattedPosts = posts.map((post) => {
    const formattedPost = _.pick(post, [
      "_id",
      "title",
      "description",
      "imgUrl",
      "createdAt",
    ]);
    formattedPost.createdAt = formatDate(post.createdAt);
    return formattedPost;
  });

  res.send(formattedPosts);
});
// Upload Posts
router.post("/:userId", [auth], async (req, res) => {
  const { userId } = req.params;
  const tokenUserId = req.user._id;

  if (!isValidObjectId(userId)) {
    return res.status(400).send("Invalid user ID.");
  }

  if (userId !== tokenUserId.toString()) {
    return res
      .status(403)
      .send("You are not authorized to post on behalf of another user.");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById(userId);
  if (!user) return res.status(404).send("User not found.");

  let post = new Post({
    user: userId,
    title: req.body.title,
    imgUrl: req.body.imgUrl,
    description: req.body.description,
  });
  post = await post.save();

  user.posts.push(post._id);
  await user.save();

  res.send(post);
});

// Update Post
router.put("/:post_id", [auth, authorized], async (req, res) => {
  if (!isValidObjectId(req.params.post_id)) {
    return res.status(400).send("Invalid post ID.");
  }

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const post = await Post.findById(req.params.post_id);
  if (!post) return res.status(404).send("Post with the given ID not found.");

  post.set({
    title: req.body.title,
    imgUrl: req.body.imgUrl,
    description: req.body.description,
  });
  await post.save();

  res.send(post);
});

// Delete Post
router.delete("/:post_id", [auth, authorized], async (req, res) => {
  if (!isValidObjectId(req.params.post_id)) {
    return res.status(400).send("Invalid post ID.");
  }

  const post = await Post.findByIdAndDelete(req.params.post_id);
  if (!post) return res.status(404).send("Post with the given ID not found.");

  res.send(`Deleted post with title: ${post.title}`);
});

// Date formatting function
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hour = d.getHours().toString().padStart(2, "0");
  return `${year}-${month}-${day} ${hour}`;
}

module.exports = router;
