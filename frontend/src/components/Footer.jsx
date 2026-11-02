import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { EMAIL } from '../api';
import { useStore } from '../context/StoreContext';
import Icon from './Icon';
import Logo from './Logo';

export default function Footer() {
  const { cfg } = useStore();
  const [cats, setCats] = useState([]);
  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="help-band">
          <div>
            <h3>Questions about an order?</h3>
            <p>Email us and a real person will get back to you.</p>
          </div>
          <div className="row gap wrap">
            <Link className="btn btn-lime" to="/contact">Contact us</Link>
            <a className="btn btn-outline-light" href={`mailto:${EMAIL}`}><Icon name="mail" size={17} /> {EMAIL}</a>
          </div>
        </div>

        <div className="f-grid">
          <div className="f-brand">
            <Logo light />
            <p>Beauty, fashion, electronics and home products in one place. Order online and pay in cash when it reaches your door.</p>
            <div className="f-pay"><Icon name="cash" size={18} /> Cash on delivery</div>
          </div>

          <nav className="f-col" aria-label="Shop">
            <h4>Shop</h4>
            <Link to="/shop">All products</Link>
            <Link to="/shop?sale=1">Sale</Link>
            <Link to="/wishlist">Wishlist</Link>
            <Link to="/orders">My orders</Link>
          </nav>

          <nav className="f-col" aria-label="Categories">
            <h4>Categories</h4>
            {cats.slice(0, 6).map((c) => <Link key={c._id} to={`/shop?category=${c.slug}`}>{c.name}</Link>)}
          </nav>

          <nav className="f-col" aria-label="Company">
            <h4>Company</h4>
            <Link to="/about">About us</Link>
            <Link to="/contact">Contact us</Link>
            <Link to="/faq">FAQs</Link>
          </nav>

          <nav className="f-col" aria-label="Help">
            <h4>Help</h4>
            <Link to="/delivery-returns">Delivery and returns</Link>
            <Link to="/privacy">Privacy policy</Link>
            <Link to="/terms">Terms of service</Link>
            <Link to="/login">Login or sign up</Link>
          </nav>
        </div>

        <div className="f-bottom">
          <small>© {new Date().getFullYear()} shaupex. All rights reserved. Delivery Rs. {cfg.shippingFee.toLocaleString()}, free above Rs. {cfg.freeShippingAbove.toLocaleString()}.</small>
          <button className="totop" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top <Icon name="up" size={16} /></button>
        </div>
      </div>
    </footer>
  );
}
