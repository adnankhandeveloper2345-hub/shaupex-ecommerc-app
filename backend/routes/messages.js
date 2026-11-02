const router = require('express').Router();
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');
const { wrap, httpError } = require('../utils/http');

// tiny anti-spam: 5 messages per IP every 10 minutes
const hits = new Map();
const limit = (req, res, next) => {
  const now = Date.now();
  const recent = (hits.get(req.ip) || []).filter((t) => now - t < 600000);
  if (recent.length >= 5) return next(httpError(429, 'Too many messages. Please try again in a few minutes.'));
  recent.push(now);
  hits.set(req.ip, recent);
  next();
};

// contact form (public)
router.post('/', limit, wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim();
  const subject = String(req.body.subject || '').trim().slice(0, 120);
  const message = String(req.body.message || '').trim();
  if (!name) throw httpError(400, 'Please enter your name');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw httpError(400, 'Please enter a valid email');
  if (message.length < 10) throw httpError(400, 'Please write a little more in your message');
  if (message.length > 2000) throw httpError(400, 'Message is too long (max 2000 characters)');
  await Message.create({ name, email, subject, message });
  res.status(201).json({ message: 'Sent' });
}));

router.get('/', protect, adminOnly, wrap(async (req, res) => res.json(await Message.find().sort('-createdAt'))));
router.put('/:id/read', protect, adminOnly, wrap(async (req, res) => {
  const m = await Message.findById(req.params.id);
  if (!m) throw httpError(404, 'Message not found');
  m.read = req.body.read !== false;
  await m.save();
  res.json(m);
}));
router.delete('/:id', protect, adminOnly, wrap(async (req, res) => {
  if (!(await Message.findByIdAndDelete(req.params.id))) throw httpError(404, 'Message not found');
  res.json({ message: 'Deleted' });
}));

module.exports = router;
