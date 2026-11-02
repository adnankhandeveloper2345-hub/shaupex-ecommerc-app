const mongoose = require('mongoose');
module.exports = mongoose.model('Settings', new mongoose.Schema({
  key: { type: String, default: 'main', unique: true },
  shippingFee: { type: Number, default: 200, min: 0 },
  freeShippingAbove: { type: Number, default: 3000, min: 0 }, // 0 = delivery is always free
}));
