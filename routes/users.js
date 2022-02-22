const router = require('express').Router();
const {
  getUserById,
  getAllUsers,
  getUser,
  findPeople,
  updateUser,
  deleteUser,
  addFollower,
  addFollowing,
  removeFollower,
  removeFollowing,
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

// follow user
router.put('/follow/:userId', isSignedIn, addFollowing, addFollower);

// unfollow user
router.put('/unfollow/:userId', isSignedIn, removeFollowing, removeFollower);

module.exports = router;
