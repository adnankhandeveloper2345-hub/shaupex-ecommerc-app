const mongoose = require('mongoose');
module.exports = mongoose.model('Category', new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true },
  emoji: { type: String, default: '🛍️' },
  color: { type: String, default: '#ff5fa8' },
}, { timestamps: true }));
