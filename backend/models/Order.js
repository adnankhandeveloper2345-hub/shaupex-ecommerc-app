const mongoose = require('mongoose');
module.exports = mongoose.model('Order', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, price: Number, qty: Number, image: String,
  }],
  address: { type: String, required: true },
  phone: { type: String, required: true },
  subtotal: { type: Number, required: true },
  coupon: { type: String, default: '' },
  discount: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'COD' },
  status: { type: String, enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true }));
