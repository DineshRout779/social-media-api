const router = require('express').Router();
const {
  getUserById,
  getAllUsers,
  getUser,
  findPeople,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
} = require('../controllers/user');
const { isSignedIn, hasAuthorization } = require('../controllers/auth');

// route params
router.param('userId', getUserById);

// get user
router.get('/:userId', isSignedIn, getUser);

// get all users
router.get('/', getAllUsers);

// find people
router.get('/findpeople/:userId', findPeople);

// update user
router.put('/:userId', isSignedIn, hasAuthorization, updateUser);

//  delete user
router.delete('/:userId', isSignedIn, hasAuthorization, deleteUser);

// get following
// router.get('/:userId/following', getFollowing);

// // get followers
// router.get('/:userId/followers', getFollowers);

// follow user
router.put('/:userId/follow', followUser);

// unfollow user
router.put('/:userId/unfollow', unfollowUser);

module.exports = router;
