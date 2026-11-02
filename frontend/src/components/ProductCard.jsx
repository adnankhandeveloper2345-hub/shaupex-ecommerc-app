import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { money } from '../api';
import Icon from './Icon';

export default function ProductCard({ p, i = 0 }) {
  const { add, wish, toggleWish } = useStore();
  const btn = useRef();
  const c = p.category || {};
  const liked = wish.includes(p._id);
  const off = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

  return (
    <article className="pcard" style={{ '--c': c.color || '#5b3df5', '--i': Math.min(i, 11) }}>
      <div className="pimg">
        <Link to={`/product/${p._id}`} aria-label={p.name} className="pimg-link">
          {p.image ? <img src={p.image} alt={p.name} loading="lazy" /> : <span className="ph">{c.emoji || '🛍️'}</span>}
        </Link>
        <div className="badges">
          {off > 0 && <span className="badge sale">-{off}%</span>}
          {p.stock === 0 ? <span className="badge out">Sold out</span> : p.stock <= 5 && <span className="badge low">Only {p.stock} left</span>}
        </div>
        <button className={`heart ${liked ? 'on' : ''}`} onClick={() => toggleWish(p._id)} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={liked}>
          <Icon name="heart" size={18} />
        </button>
        <button ref={btn} className="quickadd" disabled={!p.stock} onClick={() => add(p, 1, btn.current)}>
          <Icon name="bag" size={17} /> {p.stock ? 'Add to cart' : 'Sold out'}
        </button>
      </div>
      <div className="pinfo">
        <span className="pcat">{c.name}</span>
        <Link to={`/product/${p._id}`} className="pname">{p.name}</Link>
        <div className="pprice"><b>{money(p.price)}</b>{off > 0 && <s>{money(p.oldPrice)}</s>}</div>
      </div>
    </article>
  );
}
