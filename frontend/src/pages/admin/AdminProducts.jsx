import { useEffect, useMemo, useRef, useState } from 'react';
import api, { errMsg, money } from '../../api';
import { useToast } from '../../context/ToastContext';

const EMPTY = { name: '', description: '', price: '', discount: '', stock: '', category: '' };

export default function AdminProducts() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [currentImg, setCurrentImg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [find, setFind] = useState('');
  const fileRef = useRef();

  const load = () => api.get('/products').then((r) => setList(r.data));
  useEffect(() => { load(); api.get('/categories').then((r) => setCats(r.data)); }, []);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : currentImg), [file, currentImg]);

  const reset = () => { setF(EMPTY); setFile(null); setEditId(null); setCurrentImg(''); setErr(''); if (fileRef.current) fileRef.current.value = ''; };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const base = Number(f.price) || 0;
  const disc = Math.min(90, Math.max(0, Number(f.discount) || 0));
  const finalPrice = Math.round(base * (1 - disc / 100));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('image', file);
    try {
      if (editId) await api.put(`/products/${editId}`, fd); else await api.post('/products', fd);
      toast(editId ? 'Product updated' : 'Product added');
      reset(); load();
    } catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  const edit = (p) => {
    const hasOld = p.oldPrice > p.price;
    setEditId(p._id); setFile(null); setCurrentImg(p.image || ''); setErr('');
    setF({
      name: p.name, description: p.description, stock: p.stock, category: p.category?._id || '',
      price: hasOld ? p.oldPrice : p.price,
      discount: p.discount || (hasOld ? Math.round((1 - p.price / p.oldPrice) * 100) : ''),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api.delete(`/products/${p._id}`); toast('Product deleted'); load(); } catch (e) { toast(errMsg(e), 'warn'); }
  };

  const shown = list.filter((p) => (!filterCat || p.category?._id === filterCat) && p.name.toLowerCase().includes(find.toLowerCase()));

  return (
    <>
      <div className="admin-head"><h1>Products</h1></div>
      <form className="panel" onSubmit={submit}>
        <h3>{editId ? 'Edit product' : 'Add a product'}</h3>
        {err && <p className="error" role="alert">{err}</p>}
        {cats.length === 0 && <p className="error">Create a category first (Categories page), then come back.</p>}
        <div className="form-grid">
          <label>Name<input required value={f.name} onChange={set('name')} /></label>
          <label>Category
            <select required value={f.category} onChange={set('category')}>
              <option value="">Pick a category</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
            </select>
          </label>
          <label>Price (Rs.)<input type="number" min="0" step="any" required value={f.price} onChange={set('price')} /></label>
          <label>Discount % <small className="muted">(0 for none)</small><input type="number" min="0" max="90" step="any" value={f.discount} onChange={set('discount')} /></label>
          <label>Stock<input type="number" min="0" step="1" required value={f.stock} onChange={set('stock')} /></label>
          <label>Photo {editId && <small className="muted">(leave empty to keep current)</small>}
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setFile(e.target.files[0] || null)} />
          </label>
        </div>
        {base > 0 && (
          <p className="pricepreview">Customer pays <b>{money(finalPrice)}</b>{disc > 0 && <> <s>{money(base)}</s> <span className="badge sale">-{disc}%</span></>}</p>
        )}
        <label>Description<textarea rows={3} value={f.description} onChange={set('description')} /></label>
        {preview && <div className="preview"><img src={preview} alt="Preview" /></div>}
        <div className="row gap">
          <button className="btn btn-primary" disabled={busy || cats.length === 0}>{busy ? 'Saving…' : editId ? 'Save changes' : 'Add product'}</button>
          {editId && <button type="button" className="btn btn-ghost" onClick={reset}>Cancel</button>}
        </div>
      </form>

      <div className="panel">
        <div className="row gap wrap filters-row">
          <input type="search" placeholder="Search in list" value={find} onChange={(e) => setFind(e.target.value)} />
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="">All categories</option>
            {cats.map((c) => <option key={c._id} value={c._id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Photo</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {shown.map((p) => (
                <tr key={p._id}>
                  <td><div className="thumb" style={{ '--c': p.category?.color || '#5b3df5' }}>{p.image ? <img src={p.image} alt="" /> : <span>{p.category?.emoji}</span>}</div></td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category?.name}</td>
                  <td>{money(p.price)}{p.oldPrice > p.price && <><br /><s className="muted">{money(p.oldPrice)}</s></>}</td>
                  <td className={p.stock === 0 ? 'danger' : p.stock <= 5 ? 'warn' : ''}>{p.stock}</td>
                  <td className="actions">
                    <button className="link-btn" onClick={() => edit(p)}>Edit</button>
                    <button className="link-btn danger" onClick={() => del(p)}>Delete</button>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && <tr><td colSpan="6" className="muted">{list.length ? 'No products match.' : 'No products yet. Add your first one above.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
