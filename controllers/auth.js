const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ email });
  if (user) return res.status(403).json('User already exists');

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
    res.status(200).json(others);
  } catch (err) {
    console.log(err);
    return res.status(500).json('something went wrong!');
  }
};

exports.login = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    !user && res.status(404).json('User not registered');

    const validPassword = await bcrypt.compare(password, user.password);
    !validPassword && res.status(403).json('Wrong credentials');

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json('something went wrong!');
  }
};
