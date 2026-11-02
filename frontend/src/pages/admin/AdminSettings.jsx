import { useEffect, useState } from 'react';
import api, { errMsg, money } from '../../api';
import { useStore } from '../../context/StoreContext';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const toast = useToast();
  const { reloadSettings } = useStore();
  const [f, setF] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get('/settings').then((r) => setF({ shippingFee: r.data.shippingFee, freeShippingAbove: r.data.freeShippingAbove })); }, []);
  if (!f) return <div className="skel tall" />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await api.put('/settings', f); await reloadSettings(); toast('Delivery settings saved'); }
    catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  return (
    <>
      <div className="admin-head"><h1>Delivery settings</h1></div>
      <form className="panel narrow-panel" onSubmit={submit}>
        {err && <p className="error" role="alert">{err}</p>}
        <label>Delivery charges (Rs.)
          <input type="number" min="0" required value={f.shippingFee} onChange={(e) => setF({ ...f, shippingFee: e.target.value })} />
        </label>
        <label>Free delivery on orders above (Rs.)
          <input type="number" min="0" required value={f.freeShippingAbove} onChange={(e) => setF({ ...f, freeShippingAbove: e.target.value })} />
          <small className="muted">Enter 0 to make delivery free for everyone.</small>
        </label>
        <p className="pricepreview">
          Customers will pay <b>{money(f.shippingFee)}</b> delivery,{' '}
          {Number(f.freeShippingAbove) > 0 ? <>free above <b>{money(f.freeShippingAbove)}</b>.</> : <>but delivery is <b>always free</b>.</>}
        </p>
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
      </form>
    </>
  );
}
