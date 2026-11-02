const mongoose = require('mongoose');
module.exports = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },    // what the customer pays (after discount)
  oldPrice: { type: Number, default: 0, min: 0 },     // original price, only set when discount > 0
  discount: { type: Number, default: 0, min: 0, max: 90 }, // percent
  stock: { type: Number, default: 0, min: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  image: { type: String, default: '' },
  imagePublicId: { type: String, default: '' },
}, { timestamps: true }));
