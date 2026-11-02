import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

export default function Wishlist() {
  const { wish } = useStore();
  const [list, setList] = useState(null);

  useEffect(() => {
    if (!wish.length) { setList([]); return; }
    api.get('/products', { params: { ids: wish.join(',') } }).then((r) => setList(r.data)).catch(() => setList([]));
  }, [wish.length]); // eslint-disable-line

  const shown = (list || []).filter((p) => wish.includes(p._id));
  return (
    <div className="container section">
      <h1 className="page-h1">Your wishlist</h1>
      {list === null ? <div className="grid">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" />)}</div>
        : shown.length === 0 ? <div className="empty"><div className="empty-ic"><Icon name="heart" size={32} /></div><h3>Nothing saved yet</h3><p>Tap the heart on any product to save it here.</p><Link className="btn btn-primary" to="/shop">Browse products</Link></div>
        : <div className="grid">{shown.map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}</div>}
    </div>
  );
}
