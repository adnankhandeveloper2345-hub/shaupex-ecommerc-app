const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Order = require('../models/Order');
const User = require('../models/User');
const Message = require('../models/Message');
const { protect, adminOnly } = require('../middleware/auth');
const { wrap } = require('../utils/http');
const { cloudReady } = require('../utils/images');

router.get('/stats', protect, adminOnly, wrap(async (req, res) => {
  const [products, categories, customers, byStatus, revenue, lowStock, recent, unread] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Order.aggregate([{ $match: { status: 'Delivered' } }, { $group: { _id: null, sum: { $sum: '$total' } } }]),
    Product.find({ stock: { $lte: 5 } }).sort('stock').limit(6).populate('category', 'name emoji color'),
    Order.find().sort('-createdAt').limit(5).populate('user', 'name'),
    Message.countDocuments({ read: false }),
  ]);
  const orders = { Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
  byStatus.forEach((s) => (orders[s._id] = s.n));
  res.json({ products, categories, customers, orders, revenue: revenue[0]?.sum || 0, lowStock, recent, unread, cloudinary: cloudReady() });
}));

module.exports = router;
