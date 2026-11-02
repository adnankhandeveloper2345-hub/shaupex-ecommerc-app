const mongoose = require('mongoose');
module.exports = mongoose.model('Coupon', new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  percent: { type: Number, required: true, min: 1, max: 90 },
  minOrder: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true },
  usedCount: { type: Number, default: 0 },
}, { timestamps: true }));
