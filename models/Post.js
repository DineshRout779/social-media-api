const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    desc: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    img: {
      type: String,
      default: '',
    },
    likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        postedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
