import { useState } from 'react';
import api, { EMAIL, errMsg } from '../api';
import Icon from '../components/Icon';

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', subject: '', message: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await api.post('/messages', f); setSent(true); }
    catch (e) { setErr(errMsg(e)); }
    setBusy(false);
  };

  return (
    <>
      <section className="page-hero"><div className="container">
        <h1>Contact us</h1>
        <p>Questions about an order or a product? Send us a message.</p>
      </div></section>

      <div className="container section">
        <div className="contact">
          <div className="contact-info">
            <div className="icard"><span className="trust-ic"><Icon name="mail" size={22} /></span>
              <h3>Email</h3><p>The fastest way to reach us.</p><a href={`mailto:${EMAIL}`}><b>{EMAIL}</b></a></div>
            <div className="icard"><span className="trust-ic"><Icon name="receipt" size={22} /></span>
              <h3>About an order?</h3><p>Please include your order number. You can find it in My orders.</p></div>
            <div className="icard"><span className="trust-ic"><Icon name="help" size={22} /></span>
              <h3>Quick answers</h3><p>Many questions are already answered in our FAQs.</p><a href="/faq"><b>Read the FAQs</b></a></div>
          </div>

          {sent ? (
            <div className="panel sent">
              <div className="empty-ic ok"><Icon name="check" size={32} /></div>
              <h3>Message sent</h3>
              <p>Thank you for writing to us. We will reply to {f.email} as soon as we can.</p>
              <button className="btn btn-ghost" onClick={() => { setSent(false); setF({ name: '', email: '', subject: '', message: '' }); }}>Send another message</button>
            </div>
          ) : (
            <form className="panel" onSubmit={submit}>
              <h3>Send us a message</h3>
              {err && <p className="error" role="alert">{err}</p>}
              <div className="form-grid">
                <label>Your name<input required value={f.name} onChange={set('name')} autoComplete="name" /></label>
                <label>Email<input type="email" required value={f.email} onChange={set('email')} autoComplete="email" /></label>
              </div>
              <label>Subject <small className="muted">(optional)</small><input value={f.subject} onChange={set('subject')} maxLength={120} /></label>
              <label>Message<textarea required rows={6} minLength={10} maxLength={2000} value={f.message} onChange={set('message')} /></label>
              <button className="btn btn-primary btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Send message'}</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
