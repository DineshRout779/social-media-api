const router = require('express').Router();
const { register, login, spotify } = require('../controllers/auth');

// register
router.post('/register', register);

// login
router.post('/login', login);

// spotify API
router.get('/spotify', spotify);

module.exports = router;
