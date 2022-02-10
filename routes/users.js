const router = require('express').Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getFollowing,
  getFollowers,
  followUser,
  unfollowUser,
} = require('../controllers/user');
const { verifyToken, hasAuthorization } = require('../middlewares/verifyToken');

// get all users
router.get('/', getAllUsers);

// get user
router.get('/:id', getUser);

// update user
router.put('/:id', verifyToken, hasAuthorization, updateUser);

//  delete user
router.delete('/:id', verifyToken, hasAuthorization, deleteUser);

// get following
router.get('/:id/following', getFollowing);

// get followers
router.get('/:id/followers', getFollowers);

// follow user
router.put('/:id/follow', followUser);

// unfollow user
router.put('/:id/unfollow', unfollowUser);

module.exports = router;
