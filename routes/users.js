const router = require('express').Router();
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  followUser,
  unfollowUser,
} = require('../controllers/user');

// get all users
router.get('/', getAllUsers);

// get user
router.get('/:id', getUser);

// update user
router.put('/:id', updateUser);

//  delete user
router.delete('/:id', deleteUser);

// follow user
router.put('/:id/follow', followUser);

// unfollow user
router.put('/:id/unfollow', unfollowUser);

module.exports = router;
