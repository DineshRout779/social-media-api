const router = require('express').Router();
const {
  createPost,
  getAllPosts,
  getTimelinePosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
} = require('../controllers/posts');
const verifyToken = require('../middlewares/verifyToken');

// create a post
router.post('/', createPost);

// get all posts (temporary)
router.get('/', getAllPosts);

// get timeline posts
router.get('/timeline/:userId', getTimelinePosts);

// get a post
router.get('/:id', getPost);

// update a post
router.put('/:id', verifyToken, updatePost);

// delete a post
router.delete('/:id', verifyToken, deletePost);

// like/dislike a post
router.put('/:id/like', likePost);

module.exports = router;
