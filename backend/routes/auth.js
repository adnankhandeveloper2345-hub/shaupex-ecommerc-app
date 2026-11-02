const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/http');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pack = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, token: sign(u) });

router.post('/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!name) throw httpError(400, 'Please enter your name');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter a valid email');
  if (password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  if (await User.findOne({ email })) throw httpError(400, 'This email is already registered');
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json(pack(user));
}));

router.post('/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(String(req.body.password || ''), user.password)))
    throw httpError(401, 'Wrong email or password');
  res.json(pack(user));
}));

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;
