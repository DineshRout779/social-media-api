const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  const users = req.query.username
    ? await User.find({
        username: new RegExp(req.query.username, 'i'),
      })
    : await User.find();
  if (!users) return res.status(404).json('No user found!');
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
      if (!user) {
        return res.status(404).json('User not found!');
      }

      return res.status(200).json('account has been deleted!');
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json('you can delete only your acount');
  }
};

exports.getFollowing = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const following = await Promise.all(
      user.following.map((followedUserId) => {
        return User.findById(followedUserId);
      })
    );
    return res.status(200).json(following);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

exports.getFollowers = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    const followers = await Promise.all(
      user.followers.map((followerUserId) => {
        return User.findById(followerUserId);
      })
    );
    return res.status(200).json(followers);
  } catch (error) {
    return res.status(500).json(error.message);
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

// http://localhost:5000/api/users?username=dinesh
