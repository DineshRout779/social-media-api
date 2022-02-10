require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Please provide username, email and password!',
    });
  }

  const user = await User.findOne({ email });
  if (user)
    return res.status(403).json({
      error: 'User already exists',
    });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const { password, ...others } = newUser._doc;

    return res.status(200).json('User registered successfully!');
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password: clientPassword } = req.body;

  if (!email || !clientPassword) {
    return res.status(400).json({
      error: 'Please provide email and password!',
    });
  }
  try {
    const user = await User.findOne({ email }).populate(
      'following',
      '_id email username profilePic'
    );

    if (!user) {
      return res.status(404).json({
        error: 'User not registered!',
      });
    }

    const validPassword = await bcrypt.compare(clientPassword, user.password);
    if (!validPassword) {
      return res.status(403).json({
        error: 'Invalid credentials!',
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, { expire: new Date() + 9999 });

    const { password, ...others } = user._doc;

    return res.status(200).json({
      user: {
        ...others,
        token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err: err.message,
    });
  }
};
