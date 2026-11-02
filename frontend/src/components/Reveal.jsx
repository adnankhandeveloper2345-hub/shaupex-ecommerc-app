import { useEffect, useRef, useState } from 'react';

// fades a section in once, when it scrolls into view
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef();
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${on ? 'in' : ''} ${className}`} style={{ '--d': delay + 'ms' }}>{children}</div>;
}
