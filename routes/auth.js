const router = require('express').Router();
const {
  register,
  login,
  spotify,
  getLinkedinAccessToken,
  getLinkedinUser,
} = require('../controllers/auth');

// register
router.post('/register', register);

// login
router.post('/login', login);

// spotify API
router.get('/spotify', spotify);

// linkedin Auth APIs
router.post('/linkedin/access_token', getLinkedinAccessToken);
router.post('/linkedin/user', getLinkedinUser);

module.exports = router;
