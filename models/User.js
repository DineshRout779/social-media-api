const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 32,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePic: {
      data: Buffer,
      contentType: String,
    },
    coverPic: {
      type: String,
      default: '',
    },
    following: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    desc: {
      type: String,
      maxlength: 1000,
    },
    currentCity: {
      type: String,
      maxlength: 32,
    },
    from: {
      type: String,
      maxlength: 32,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
