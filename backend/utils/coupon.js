const Coupon = require('../models/Coupon');
const { httpError } = require('./http');

exports.checkCoupon = async (code, subtotal) => {
  const c = await Coupon.findOne({ code: String(code || '').trim().toUpperCase() });
  if (!c || !c.active) throw httpError(400, 'This coupon code is not valid');
  if (subtotal < c.minOrder) throw httpError(400, `This coupon needs an order of at least Rs. ${c.minOrder.toLocaleString()}`);
  return { coupon: c, discount: Math.round((subtotal * c.percent) / 100) };
};
