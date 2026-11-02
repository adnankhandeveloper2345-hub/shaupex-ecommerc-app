import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api';
import AuthShell from './AuthShell';

export default function Register() {
  const { user, register } = useAuth();
  const nav = useNavigate();
  const from = useLocation().state?.from;
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr('');
    try { await register(f.name, f.email, f.password); nav(from || '/', { replace: true }); }
    catch (e) { setErr(errMsg(e)); setBusy(false); }
  };

  return (
    <AuthShell>
      <form onSubmit={submit}>
        <h1>Create your account</h1>
        <p className="muted">It takes less than a minute.</p>
        {err && <p className="error" role="alert">{err}</p>}
        <label>Full name<input required autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label>Email<input type="email" required autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password <small className="muted">(at least 6 characters)</small><input type="password" minLength={6} required autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        <p className="muted center">Already have an account? <Link to="/login" state={{ from }}>Login</Link></p>
      </form>
    </AuthShell>
  );
}
