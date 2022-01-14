const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users) return res.status(404).json('User not found!');

  return res.status(200).json(users);
};

exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json('User not found!');

  const { password, updatedAt, ...others } = user._doc;
  return res.status(200).json(others);
};

exports.updateUser = async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body,
      });
      return res.status(200).json('account has been updated!');
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('you can update only your acount');
  }
};

exports.deleteUser = async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      return res.status(200).json('account has been deleted!');
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('you can delete only your acount');
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
