const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'No token found!',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'Token not valid!',
        });
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'You are not authorized',
    });
  }
};

module.exports = verifyToken;
