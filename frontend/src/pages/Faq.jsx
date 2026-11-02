import { Link } from 'react-router-dom';
import { money } from '../api';
import { useStore } from '../context/StoreContext';

export default function Faq() {
  const { cfg } = useStore();
  const free = cfg.freeShippingAbove > 0 ? `Orders above ${money(cfg.freeShippingAbove)} get free delivery.` : 'Delivery is free on all orders.';
  const qa = [
    ['How do I pay?', 'Every order is cash on delivery. You do not pay anything online. Keep the exact amount ready when the order arrives.'],
    ['How much is delivery?', `Delivery costs ${money(cfg.shippingFee)}. ${free}`],
    ['Can I cancel my order?', 'Yes. While an order is still Pending you can cancel it yourself from My orders. Once it has shipped, please email us and we will see what we can do.'],
    ['How do coupon codes work?', 'Enter your code on the checkout page and press Apply. The discount is taken off your items total. Some coupons need a minimum order amount.'],
    ['How do I track my order?', 'Open My orders after logging in. Each order shows whether it is placed, shipped or delivered.'],
    ['A product is sold out. What now?', 'Sold out items cannot be ordered. Save it to your wishlist and check back later, new stock is added from time to time.'],
    ['I received a damaged or wrong item.', 'We are sorry about that. Email us with your order number and a photo and we will look into it.'],
  ];
  return (
    <>
      <section className="page-hero"><div className="container"><h1>Frequently asked questions</h1><p>Quick answers to common questions.</p></div></section>
      <div className="container section narrow-col">
        <div className="faq">
          {qa.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </div>
        <p className="muted center">Still need help? <Link to="/contact">Contact us</Link></p>
      </div>
    </>
  );
}
