import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import Icon from '../components/Icon';

export default function Shop() {
  const [sp, setSp] = useSearchParams();
  const category = sp.get('category') || '';
  const q = sp.get('q') || '';
  const sort = sp.get('sort') || 'new';
  const sale = sp.get('sale') === '1';
  const min = sp.get('min') || '';
  const max = sp.get('max') || '';

  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showF, setShowF] = useState(false);
  const [minI, setMinI] = useState(min);
  const [maxI, setMaxI] = useState(max);

  const update = (obj) =>
    setSp((prev) => {
      const n = new URLSearchParams(prev);
      Object.entries(obj).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
      return n;
    });

  useEffect(() => { api.get('/categories').then((r) => setCats(r.data)).catch(() => {}); }, []);
  useEffect(() => { setMinI(min); setMaxI(max); }, [min, max]);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    api.get('/products', { params: { category, search: q, sort, sale: sale ? 1 : undefined, minPrice: min || undefined, maxPrice: max || undefined } })
      .then((r) => alive && setProducts(r.data))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [category, q, sort, sale, min, max]);

  const current = cats.find((c) => c.slug === category);
  const filtered = category || q || sale || min || max;
  const title = q ? `Results for "${q}"` : current ? current.name : sale ? 'Sale' : 'All products';

  return (
    <div className="container section">
      <p className="crumbs"><Link to="/">Home</Link> <Icon name="chevron" size={14} /> <span>{title}</span></p>
      <div className="shop-head">
        <h1>{title}</h1>
        <div className="row gap">
          <button className="btn btn-ghost btn-sm filter-toggle" onClick={() => setShowF(!showF)}><Icon name="filter" size={16} /> Filters</button>
          <label className="sortbox">Sort by
            <select value={sort} onChange={(e) => update({ sort: e.target.value === 'new' ? '' : e.target.value })}>
              <option value="new">Newest</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="shop-layout">
        <aside className={`filters ${showF ? 'show' : ''}`}>
          <h4>Categories</h4>
          <div className="flist">
            <button className={!category ? 'on' : ''} onClick={() => update({ category: '' })}>All products</button>
            {cats.map((c) => (
              <button key={c._id} className={category === c.slug ? 'on' : ''} onClick={() => update({ category: c.slug })}>
                <span>{c.emoji} {c.name}</span><small>{c.productCount}</small>
              </button>
            ))}
          </div>
          <h4>Price (Rs.)</h4>
          <form className="prange" onSubmit={(e) => { e.preventDefault(); update({ min: minI, max: maxI }); }}>
            <input type="number" min="0" placeholder="Min" value={minI} onChange={(e) => setMinI(e.target.value)} aria-label="Minimum price" />
            <span>to</span>
            <input type="number" min="0" placeholder="Max" value={maxI} onChange={(e) => setMaxI(e.target.value)} aria-label="Maximum price" />
            <button className="btn btn-dark btn-sm">Go</button>
          </form>
          <label className="check"><input type="checkbox" checked={sale} onChange={(e) => update({ sale: e.target.checked ? '1' : '' })} /> On sale only</label>
          {filtered && <button className="btn btn-ghost btn-sm btn-block" onClick={() => setSp({})}>Clear all filters</button>}
        </aside>

        <section>
          {!loading && <p className="muted resultcount">{products.length} product{products.length === 1 ? '' : 's'}</p>}
          {loading ? (
            <div className="grid">{Array.from({ length: 6 }, (_, i) => <div key={i} className="skel" />)}</div>
          ) : products.length === 0 ? (
            <div className="empty">
              <div className="empty-ic"><Icon name="search" size={32} /></div>
              <h3>No products found</h3>
              <p>{filtered ? 'Try a different search or clear the filters.' : 'The store has no products yet.'}</p>
              {filtered && <button className="btn btn-primary" onClick={() => setSp({})}>Clear filters</button>}
            </div>
          ) : (
            <div className="grid" key={category + q + sort + sale + min + max}>
              {products.map((p, i) => <ProductCard key={p._id} p={p} i={i} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
