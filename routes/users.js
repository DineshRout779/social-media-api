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
  getRestaurants,
  getRestaurantById,
} = require('../controllers/user');
const { isSignedIn, hasAuthorization } = require('../controllers/auth');
const fetch = require('cross-fetch');

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

// swiggy's API
router.post('/swiggy/restaurants', getRestaurants);

router.get('/swiggy/restaurants/:id', getRestaurantById);

module.exports = router;
