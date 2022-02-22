const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.getUserById = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
      .select('-profilePic')
      .populate('followers', '_id username')
      .populate('following', '_id username');
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

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

exports.addFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.profile._id, {
      $push: { following: req.body.followId },
    });
    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addFollower = async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(
      req.body.followId,
      { $push: { followers: req.profile._id } },
      { new: true }
    )
      .populate('following', '_id username')
      .populate('followers', '_id username');

    result.password = undefined;
    result.salt = undefined;
    result.profilePic = undefined;
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.removeFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.profile._id, {
      $pull: { following: req.body.unfollowId },
    });
    next();
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.removeFollower = async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(
      req.body.unfollowId,
      { $pull: { followers: req.profile._id } },
      { new: true }
    )
      .populate('following', '_id name')
      .populate('followers', '_id name');

    result.password = undefined;
    result.salt = undefined;
    result.profilePic = undefined;
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json(err);
  }
};

// http://localhost:5000/api/users
