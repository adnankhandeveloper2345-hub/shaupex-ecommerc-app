import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { money } from '../api';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import Icon from '../components/Icon';

export default function Home() {
  const { cfg } = useStore();
  const [cats, setCats] = useState([]);
  const [fresh, setFresh] = useState(null);
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    api.get('/categories').then((r) => setCats(r.data)).catch(() => {});
    api.get('/products', { params: { limit: 8, sort: 'new' } }).then((r) => setFresh(r.data)).catch(() => setFresh([]));
    api.get('/products', { params: { limit: 4, sale: 1 } }).then((r) => setDeals(r.data)).catch(() => {});
  }, []);

  // hero shows the newest products, or categories if the shop has no products yet
  const floating = (fresh || []).length
    ? fresh.slice(0, 3).map((p) => ({ key: p._id, to: `/product/${p._id}`, img: p.image, emoji: p.category?.emoji, color: p.category?.color, title: p.name, sub: money(p.price) }))
    : cats.slice(0, 3).map((c) => ({ key: c._id, to: `/shop?category=${c.slug}`, emoji: c.emoji, color: c.color, title: c.name, sub: 'Shop now' }));

  const trust = [
    ['cash', 'Cash on delivery', 'Pay when your order arrives'],
    ['truck', cfg.freeShippingAbove > 0 ? 'Free delivery' : 'Free delivery on all orders', cfg.freeShippingAbove > 0 ? `On orders above ${money(cfg.freeShippingAbove)}` : 'No delivery charges'],
    ['undo', 'Easy cancellation', 'Cancel any time before it ships'],
    ['mail', 'Real support', 'We reply to every email'],
  ];

  return (
    <>
      <div className="container">
        <section className="hero">
          <div className="blob b1" /><div className="blob b2" />
          <div className="hero-copy">
            <span className="hero-badge"><i /> Cash on delivery on every order</span>
            <h1>
              <span className="ln"><span>Everything you love,</span></span>
              <span className="ln"><span>delivered to your door.</span></span>
            </h1>
            <p>Beauty, fashion, gadgets and home picks, all in one store. Order online, pay in cash when it arrives.</p>
            <div className="row gap wrap">
              <Link className="btn btn-lime btn-lg" to="/shop">Shop now <Icon name="arrow" size={18} /></Link>
              <Link className="btn btn-outline-light btn-lg" to="/shop?sale=1">See deals</Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden={floating.length === 0}>
            {floating.map((f) => (
              <Link key={f.key} to={f.to} className="fcard" style={{ '--c': f.color || '#5b3df5' }}>
                <div className="fimg">{f.img ? <img src={f.img} alt="" /> : <span>{f.emoji || '🛍️'}</span>}</div>
                <strong>{f.title}</strong>
                <small>{f.sub}</small>
              </Link>
            ))}
          </div>
        </section>

        <div className="trust">
          {trust.map(([ic, t, s]) => (
            <div key={t}><span className="trust-ic"><Icon name={ic} size={22} /></span><div><strong>{t}</strong><small>{s}</small></div></div>
          ))}
        </div>
      </div>

      {cats.length > 0 && (
        <Reveal className="container section">
          <div className="section-head"><div><h2>Shop by category</h2><p>Find what you are looking for faster.</p></div></div>
          <div className="ctiles">
            {cats.map((c) => (
              <Link key={c._id} to={`/shop?category=${c.slug}`} className="ctile" style={{ '--c': c.color }}>
                <span className="ctile-emoji">{c.emoji}</span>
                <strong>{c.name}</strong>
                <small>{c.productCount} product{c.productCount === 1 ? '' : 's'}</small>
                <Icon name="arrow" size={18} className="ctile-arrow" />
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      <Reveal className="container section">
        <div className="section-head">
          <div><h2>New arrivals</h2><p>Fresh picks added to the store.</p></div>
          <Link className="more" to="/shop">View all <Icon name="arrow" size={16} /></Link>
        </div>
        {fresh === null ? <div className="grid">{Array.from({ length: 4 }, (_, i) => <div key={i} className="skel" />)}</div>
          : fresh.length === 0 ? <div className="empty"><h3>No products yet</h3><p>Check back soon, new products are on the way.</p></div>
          : <div className="grid">{fresh.map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}</div>}
      </Reveal>

      <Reveal className="container section">
        <div className="promos">
          <div className="promo violet">
            <h3>{cfg.freeShippingAbove > 0 ? `Free delivery above ${money(cfg.freeShippingAbove)}` : 'Free delivery on every order'}</h3>
            <p>Fill your cart and the delivery charges are on us.</p>
            <Link className="btn btn-lime" to="/shop">Start shopping</Link>
          </div>
          <div className="promo lime">
            <h3>Pay when it arrives</h3>
            <p>No cards, no online payment. Keep cash ready for the rider.</p>
            <Link className="btn btn-dark" to="/faq">How it works</Link>
          </div>
        </div>
      </Reveal>

      {deals.length > 0 && (
        <Reveal className="container section">
          <div className="section-head">
            <div><h2>On sale now</h2><p>Limited-time discounts picked for you.</p></div>
            <Link className="more" to="/shop?sale=1">All deals <Icon name="arrow" size={16} /></Link>
          </div>
          <div className="grid">{deals.map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}</div>
        </Reveal>
      )}
    </>
  );
}
