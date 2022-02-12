const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getUserById = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
      .select('-profilePic')
      .populate('following', '_id username email')
      .populate('followers', '_id username email');
    if (!user)
      return res.status(404).json({
        error: 'User not found',
      });

    req.profile = user;
    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.getUser = (req, res) => {
  req.profile.password = undefined;
  return res.json(req.profile);
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = req.query.username
      ? await User.find({
          username: new RegExp(req.query.username, 'i'),
        }).select('_id username email')
      : await User.find().select('_id username email');
    if (!users) return res.status(404).json('No user found!');
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(error);
  }
};

exports.findPeople = async (req, res) => {
  let following = [
    ...req.profile.following,
    {
      _id: req.profile._id,
      username: req.profile.username,
      email: req.profile.email,
    },
  ];
  try {
    let users = await User.find({ _id: { $nin: following } }).select(
      '_id username'
    );
    res.status(200).json(users);
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err),
    });
  }
};

exports.updateUser = async (req, res) => {
  if (req.body.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    } catch (err) {
      return res.status(500).json({ err });
    }
  }
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.profile._id,
      {
        $set: req.body,
      },
      {
        new: true,
      }
    );
    const { password, ...others } = updatedUser._doc;
    return res.status(200).json(others);
  } catch (err) {
    return res.status(500).json({ err });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.profile._id);

    return res.status(200).json(deletedUser);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.followUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (
        !user.followers.includes(currentUser._id) &&
        !currentUser.following.includes(user._id)
      ) {
        await user.updateOne({ $push: { followers: currentUser._id } });
        await currentUser.updateOne({ $push: { following: user._id } });
        return res.status(200).json('account has been followed!');
      } else {
        return res.status(403).json(`Already been followed!`);
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json(`you can't follow yourself!`);
  }
};

exports.unfollowUser = async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (
        user.followers.includes(currentUser._id) &&
        currentUser.following.includes(user._id)
      ) {
        await user.updateOne({ $pull: { followers: currentUser._id } });
        await currentUser.updateOne({ $pull: { following: user._id } });
        res.status(200).json(`user has been unfollowed!`);
      } else {
        res.status(403).json(`You don't follow this user!`);
      }
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json(`you can't unfollow yourself!`);
  }
};

// http://localhost:5000/api/users
