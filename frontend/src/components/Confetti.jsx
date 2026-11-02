import { useEffect, useMemo, useState } from 'react';

const COLORS = ['#5b3df5', '#c6f432', '#e0457b', '#3b82f6', '#f59e0b', '#16a34a'];

export default function Confetti() {
  const [show, setShow] = useState(true);
  const bits = useMemo(
    () => Array.from({ length: 56 }, (_, i) => ({
      left: Math.random() * 100, d: Math.random() * 0.8, t: 2.2 + Math.random() * 1.8,
      c: COLORS[i % COLORS.length], r: Math.random() > 0.5 ? '50%' : '2px',
    })),
    []
  );
  useEffect(() => { const t = setTimeout(() => setShow(false), 5000); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((b, i) => <span key={i} style={{ left: b.left + '%', background: b.c, borderRadius: b.r, animationDelay: b.d + 's', animationDuration: b.t + 's' }} />)}
    </div>
  );
}
