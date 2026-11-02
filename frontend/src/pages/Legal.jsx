import { Link } from 'react-router-dom';
import { EMAIL, money } from '../api';
import { useStore } from '../context/StoreContext';

export default function Legal({ page }) {
  const { cfg } = useStore();
  const free = cfg.freeShippingAbove > 0 ? `Orders above ${money(cfg.freeShippingAbove)} are delivered free.` : 'Delivery is free on all orders.';

  const pages = {
    delivery: {
      title: 'Delivery and returns',
      intro: 'How we deliver your order, and what to do if something is wrong.',
      sections: [
        ['Delivery charges', `Delivery costs ${money(cfg.shippingFee)} per order. ${free} The delivery charge is always shown in your cart and at checkout before you place the order.`],
        ['Payment', 'All orders are cash on delivery. Please keep the exact amount ready when the order arrives.'],
        ['Order status', 'After you order, your order is Pending. It then becomes Shipped when it leaves us, and Delivered when it reaches you. You can see the status any time in My orders.'],
        ['Cancelling an order', 'You can cancel an order yourself from My orders while it is still Pending. If it has already shipped, please email us as soon as possible.'],
        ['Damaged or wrong items', `If your item arrives damaged or is not what you ordered, email ${EMAIL} with your order number and a photo. We will review it and make it right.`],
      ],
    },
    privacy: {
      title: 'Privacy policy',
      intro: 'What information we collect and how we use it.',
      sections: [
        ['What we collect', 'When you create an account or place an order we collect your name, email address, delivery address and phone number. If you write to us through the contact form we keep your message and email so we can reply.'],
        ['How we use it', 'We use your details to run your account, process and deliver your orders, and answer your questions. We do not use them for anything unrelated.'],
        ['Sharing', 'We do not sell your personal information. Your name, address and phone number are used only to deliver your order.'],
        ['Passwords and security', 'Your password is stored in a protected form and cannot be read by us. Please keep your login details private.'],
        ['Your choices', `You can ask us to correct or delete your account details at any time by emailing ${EMAIL}.`],
      ],
    },
    terms: {
      title: 'Terms of service',
      intro: 'The simple rules for using shaupex.',
      sections: [
        ['Using the store', 'By using shaupex you agree to use it lawfully and to give correct information when you register and order.'],
        ['Your account', 'You are responsible for keeping your password safe and for activity on your account.'],
        ['Orders and prices', 'Prices and availability can change. An order is confirmed once we accept it. If an item turns out to be unavailable or a price was shown incorrectly, we may cancel that order.'],
        ['Payment and delivery', 'Payment is cash on delivery. Delivery charges are shown before you place your order. Please be available at the delivery address and phone number you provide.'],
        ['Cancellations and returns', 'See our Delivery and returns page for how cancellations and problems with an order are handled.'],
        ['Changes', 'We may update these terms from time to time. Continuing to use the store means you accept the updated terms.'],
        ['Contact', `Questions about these terms can be sent to ${EMAIL}.`],
      ],
    },
  };
  const p = pages[page];

  return (
    <>
      <section className="page-hero"><div className="container"><h1>{p.title}</h1><p>{p.intro}</p></div></section>
      <div className="container section narrow-col">
        <div className="legal">
          {p.sections.map(([h, t]) => <section key={h}><h3>{h}</h3><p>{t}</p></section>)}
        </div>
        <p className="muted">Need more help? <Link to="/contact">Contact us</Link></p>
      </div>
    </>
  );
}
