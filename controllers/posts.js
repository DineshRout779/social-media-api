const Post = require('../models/Post');

exports.getPostById = async (req, res, next, id) => {
  try {
    let post = await Post.findById(id).populate(
      'postedBy',
      '_id username email'
    );
    if (!post)
      return res.status(404).json({
        error: 'Post not found',
      });

    req.post = post._doc;
    next();
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getPost = async (req, res) => {
  try {
    return res.status(200).json(req.post);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    if (!posts) return res.status(400).json('no posts!');

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getOwnPosts = async (req, res) => {
  try {
    const myPosts = await Post.find({
      postedBy: req.profile._id,
    }).populate('postedBy', '_id username email');
    return res.status(200).json(myPosts);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.getTimelinePosts = async (req, res) => {
  let following = [
    ...req.profile.following,
    {
      _id: req.profile._id,
      username: req.profile.username,
      email: req.profile.email,
    },
  ];
  try {
    let posts = await Post.find({ postedBy: { $in: following } })
      .populate('postedBy', '_id username')
      .sort('-createdAt');
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error });
  }
};

exports.createPost = async (req, res) => {
  const newPost = new Post(req.body);
  try {
    let savedPost = await newPost.save();
    savedPost = await savedPost.populate('postedBy', '_id username');
    return res.status(200).json(savedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.post._id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    return res.status(200).json(updatedPost);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.post._id);
    return res.status(200).json(deletedPost);
  } catch (error) {
    return res.status(500).json(error);
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
  } catch (error) {
    return res.status(500).json(error);
  }
};
