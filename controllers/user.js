const User = require('../models/User');
const bcrypt = require('bcrypt');
const fetch = require('cross-fetch');

exports.getUserById = async (req, res, next, id) => {
  try {
    let user = await User.findById(id)
      .populate('followers', '_id username profilePic')
      .populate('following', '_id username profilePic');
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
        }).select('_id username email profilePic')
      : await User.find().select('_id username email profilePic');
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
      '_id username profilePic'
    );
    res.status(200).json(users);
  } catch (err) {
    return res.status(400).json(err);
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
    if (!req.profile.following.some((u) => u._id === req.body.followId)) {
      await User.findByIdAndUpdate(req.profile._id, {
        $addToSet: { following: req.body.followId },
      });
      next();
    } else {
      return res.status(500).json({ err: 'Already following..' });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};

exports.addFollower = async (req, res) => {
  try {
    let result = await User.findByIdAndUpdate(
      req.body.followId,
      { $addToSet: { followers: req.profile._id } },
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

exports.getRestaurants = async (req, res) => {
  const { latitude, longitude } = req.body;

  // console.log(req.body);

  const url = `https://www.swiggy.com/dapi/restaurants/list/v5?lat=${latitude}&lng=${longitude}&is-seo-homepage-enabled=true&page_type=DESKTOP_WEB_LISTING`;

  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
};

exports.getRestaurantById = async (req, res) => {
  const { id } = req.params;

  const url = `https://www.swiggy.com/dapi/menu/pl?page-type=REGULAR_MENU&complete-menu=true&lat=20.275845&lng=85.776639&restaurantId=${id}&catalog_qa=undefined&submitAction=ENTER`;

  fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      res.json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('An error occurred');
    });
};

// http://localhost:5000/api/users
