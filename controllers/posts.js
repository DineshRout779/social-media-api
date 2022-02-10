const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    return res.status(200).json(savedPost);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(
      'userId',
      'username email _id profilePic'
    );
    if (!posts) return res.status(400).json('no posts!');
    return res.status(200).json(posts);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getTimelinePosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id }).populate(
      'userId',
      'username email _id profilePic'
    );
    const friendsPosts = await Promise.all(
      currentUser.following.map((friendId) => {
        return Post.find({ userId: friendId }).populate('userId');
      })
    );
    return res.status(200).json(userPosts.concat(...friendsPosts));
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      'userId',
      'username email _id profilePic'
    );
    if (!post) return res.status(404).json('post not found!');

    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    await post.updateOne({ $set: req.body });
    return res.status(200).json('post has been updated');
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.deletePost = async (req, res) => {
  try {
    console.log(req.body);
    const post = await Post.findById(req.params.id);
    await post.deleteOne();
    return res.status(200).json('post has been deleted');
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('post has been liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('post has been disliked');
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};
