import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { money } from '../api';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

export default function ProductPage() {
  const { id } = useParams();
  const { add, wish, toggleWish, items, cfg } = useStore();
  const [p, setP] = useState(null);
  const [missing, setMissing] = useState(false);
  const [qty, setQty] = useState(1);
  const [more, setMore] = useState([]);
  const btn = useRef();

  useEffect(() => {
    let alive = true;
    setP(null); setMissing(false); setQty(1); setMore([]);
    (async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        if (!alive) return;
        setP(data);
        const r = await api.get('/products', { params: { category: data.category?._id, limit: 5 } }).catch(() => ({ data: [] }));
        if (alive) setMore(r.data.filter((x) => x._id !== id).slice(0, 4));
      } catch { if (alive) setMissing(true); }
    })();
    return () => { alive = false; };
  }, [id]);

  if (missing) return <div className="container section"><div className="empty"><h3>Product not found</h3><p>It may have been removed.</p><Link className="btn btn-primary" to="/shop">Back to shop</Link></div></div>;
  if (!p) return <div className="container section"><div className="pp"><div className="skel sq" /><div className="skel tall" /></div></div>;

  const c = p.category || {};
  const inCart = items.find((i) => i._id === p._id)?.qty || 0;
  const left = p.stock - inCart;
  const liked = wish.includes(p._id);
  const off = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return (
    <div className="container section">
      <p className="crumbs"><Link to="/">Home</Link> <Icon name="chevron" size={14} /> <Link to="/shop">Shop</Link> <Icon name="chevron" size={14} /> <Link to={`/shop?category=${c.slug}`}>{c.name}</Link></p>
      <div className="pp">
        <div className="pp-media" style={{ '--c': c.color || '#5b3df5' }}>
          {p.image ? <img src={p.image} alt={p.name} /> : <span className="ph">{c.emoji || '🛍️'}</span>}
          {off > 0 && <span className="badge sale lg">-{off}%</span>}
        </div>

        <div className="pp-info">
          <Link className="cat-pill" to={`/shop?category=${c.slug}`}>{c.emoji} {c.name}</Link>
          <h1>{p.name}</h1>
          <div className="pp-price"><b>{money(p.price)}</b>{off > 0 && <><s>{money(p.oldPrice)}</s><span className="save">You save {money(p.oldPrice - p.price)}</span></>}</div>
          <p className={`stockline ${p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'in'}`}>
            <i />{p.stock === 0 ? 'Out of stock' : p.stock <= 5 ? `Only ${p.stock} left in stock` : 'In stock'}
          </p>
          <p className="pp-desc">{p.description || 'No description has been added for this product yet.'}</p>

          {p.stock > 0 && (
            <div className="row gap wrap buy">
              <div className="qty lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Icon name="minus" size={16} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(Math.max(left, 1), qty + 1))} aria-label="Increase"><Icon name="plus" size={16} /></button>
              </div>
              <button ref={btn} className="btn btn-primary btn-lg grow" disabled={left < 1} onClick={() => add(p, qty, btn.current)}>
                <Icon name="bag" size={19} /> {left < 1 ? 'All available are in your cart' : 'Add to cart'}
              </button>
              <button className={`btn btn-ghost btn-lg icononly ${liked ? 'liked' : ''}`} onClick={() => toggleWish(p._id)} aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'} aria-pressed={liked}>
                <Icon name="heart" size={20} />
              </button>
            </div>
          )}

          <ul className="pp-perks">
            <li><Icon name="cash" /><div><strong>Cash on delivery</strong><small>Pay when your order arrives.</small></div></li>
            <li><Icon name="truck" /><div><strong>Delivery {money(cfg.shippingFee)}</strong><small>{cfg.freeShippingAbove > 0 ? `Free on orders above ${money(cfg.freeShippingAbove)}.` : 'Free on all orders.'}</small></div></li>
            <li><Icon name="undo" /><div><strong>Cancel before it ships</strong><small>From My orders, any time while pending.</small></div></li>
          </ul>
        </div>
      </div>

      {more.length > 0 && (
        <section className="section-sm">
          <div className="section-head"><div><h2>More in {c.name}</h2></div></div>
          <div className="grid">{more.map((m, i) => <ProductCard key={m._id} p={m} i={i} />)}</div>
        </section>
      )}
    </div>
  );
}
