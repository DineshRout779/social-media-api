const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        error: 'No token found!',
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          error: 'Token not valid!',
        });
      }

      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      error: 'Unauthorized! No token found.',
    });
  }
};

const hasAuthorization = (req, res, next) => {
  if (req.user._id != req.body.userId) {
    return res.status(403).json({
      error: 'You are not authorized',
    });
  }
  next();
};

module.exports = { verifyToken, hasAuthorization };
