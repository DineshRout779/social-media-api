const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const querystring = require('querystring');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: 'Please provide username, email and password!',
    });
  }

  const user = await User.findOne({ email });
  if (user)
    return res.status(403).json({
      error: 'User already exists',
    });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const { password, ...others } = newUser._doc;

    return res.status(200).json('User registered successfully!');
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { email, password: clientPassword } = req.body;

  if (!email || !clientPassword) {
    return res.status(400).json({
      error: 'Please provide email and password!',
    });
  }
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: 'User not registered!',
      });
    }

    const validPassword = await bcrypt.compare(clientPassword, user.password);
    if (!validPassword) {
      return res.status(403).json({
        error: 'Invalid credentials!',
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, { expire: new Date() + 9999 });

    const { password, ...others } = user._doc;

    return res.status(200).json({
      user: {
        _id: others._id,
        username: others.username,
        email: others.email,
        token,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      err: err.message,
    });
  }
};

exports.signOut = (req, res) => {
  res.clearCookie('token');
  return res.status('200').json({
    message: 'signed out',
  });
};

exports.isSignedIn = (req, res, next) => {
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

exports.hasAuthorization = (req, res, next) => {
  // console.log(req.profile._id);
  // console.log(req.user._id);
  const authorized = req.profile && req.user && req.profile._id == req.user._id;
  if (!authorized) {
    return res.status(403).json({
      error: 'You are not authorized',
    });
  }
  next();
};

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOP_TRACKS_ENDPOINT = `https://api.spotify.com/v1/me/top/tracks`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  try {
    const body = querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token,
    });
    const headers = {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const res = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: headers,
      body: body,
    });

    return await res.json();
  } catch (error) {
    console.log(error);
  }
};

const getNowPlaying = async (req, res) => {
  const { access_token } = await getAccessToken();

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

exports.getTopTracks = async (req, res) => {
  const { access_token } = await getAccessToken();

  return fetch(TOP_TRACKS_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

exports.spotify = async (req, res) => {
  const response = await getNowPlaying();

  if (response.status === 204 || response.status > 400) {
    return res.status(200).json({ isPlaying: false });
  }

  const song = await response.json();
  const isPlaying = song.is_playing;
  const title = song.item.name;
  const artist = song.item.artists.map((_artist) => _artist.name).join(', ');
  const album = song.item.album.name;
  const albumImageUrl = song.item.album.images[0].url;
  const songUrl = song.item.external_urls.spotify;

  return res.status(200).json({
    song: {
      album,
      albumImageUrl,
      artist,
      songUrl,
      title,
    },
    isPlaying: song.is_playing,
  });
};

// linkedin API
exports.getLinkedinAccessToken = async (req, res) => {
  const clientId = process.env.LINKEDIN_AUTH_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_AUTH_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_AUTH_REDIRECT_URL;

  const { code } = req.body;

  if (!code) {
    return res.status(403).json({
      message: 'No authorization code provided',
      error: 'No authorization code provided',
    });
  }

  const requestBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  try {
    const response = await fetch(
      'https://www.linkedin.com/oauth/v2/accessToken',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Access-Control-Allow-Origin': '*',
        },
        body: requestBody,
      }
    );

    const data = await response.json();
    return res.status(200).json({
      data,
    });
  } catch (error) {
    console.error('Error exchanging code for token:', error.message);
    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};

exports.getLinkedinUser = async (req, res) => {
  try {
    const { access_token } = req.body;
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const data = await response.json();

    return res.status(200).json({
      user: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: 'Server error',
      error,
    });
  }
};
