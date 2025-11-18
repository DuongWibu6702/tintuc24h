const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// Tạo Access Token
function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );
}

// Tạo Refresh Token
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );
}

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra user trong DB
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Wrong username' });

    // Kiểm tra password
    const isMatch = await user.comparePassword(password); // tùy schema bạn
    if (!isMatch) return res.status(400).json({ msg: 'Wrong password' });

    // Tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token vào DB
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken
    });

    res.json({
      accessToken,
      refreshToken
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(401);

    // Kiểm tra token trong DB
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.sendStatus(403);

    // Xác minh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.sendStatus(403);

      // Lấy user từ DB để gán role mới
      const user = await User.findById(decoded.id);
      if (!user) return res.sendStatus(403);

      const newAccess = generateAccessToken(user);

      res.json({ accessToken: newAccess });
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.sendStatus(400);

    // Xóa refresh token khỏi DB → đăng xuất
    await RefreshToken.deleteOne({ token: refreshToken });

    res.json({ msg: 'Logged out' });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
