const router = require('express').Router();
const {
  getPostById,
  createPost,
  getAllPosts,
  getTimelinePosts,
  getPost,
  updatePost,
  deletePost,
  likePost,
  getOwnPosts,
} = require('../controllers/posts');
const { getUserById } = require('../controllers/user');
const { isSignedIn, hasAuthorization } = require('../controllers/auth');

// route params
router.param('postId', getPostById);
router.param('userId', getUserById);

// get a post
router.get('/:postId', getPost);

// get all posts (temporary)
router.get('/', getAllPosts);

// get a user's posts
router.get('/myposts/:userId', getOwnPosts);

// create a post
router.post('/:userId', createPost);

// get timeline posts
router.get('/feed/:userId', getTimelinePosts);

// update a post
router.put('/:postId/:userId', isSignedIn, hasAuthorization, updatePost);

// delete a post
router.delete('/:postId/:userId', isSignedIn, hasAuthorization, deletePost);

// // like/dislike a post
// router.put('/:postId/like/:userId', likePost);

module.exports = router;
