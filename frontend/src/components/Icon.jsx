const P = {
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  heart: <path d="M12 20s-7.5-4.5-9.3-9.4C1.5 7.200 3.700 4 7 4c2 0 3.700 1.100 5 2.900C13.300 5.100 15 4 17 4c3.300 0 5.500 3.200 4.300 6.600C19.500 15.500 12 20 12 20z" />,
  bag: <><path d="M6 7h12l1 13H5L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.500-6 8-6s8 2 8 6" /></>,
  truck: <><path d="M2 6h11v10H2z" /><path d="M13 9h5l3 3v4h-8z" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>,
  cash: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="3" /></>,
  undo: <><path d="M3 12a9 9 0 1 0 3-6.700" /><path d="M3 4v5h5" /></>,
  shield: <><path d="M12 3l8 3v6c0 5-3.500 8-8 9-4.500-1-8-4-8-9V6l8-3z" /><path d="m9 12 2 2 4-4" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  pin: <><path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11z" /><circle cx="12" cy="10" r="2.500" /></>,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12 5 5 9-10" />,
  trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  down: <path d="m6 9 6 6 6-6" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  logout: <path d="M10 4H5v16h5M15 8l4 4-4 4M9 12h10" />,
  grid: <><rect x="3" y="3" width="7.500" height="7.500" rx="1.500" /><rect x="13.500" y="3" width="7.500" height="7.500" rx="1.500" /><rect x="3" y="13.500" width="7.500" height="7.500" rx="1.500" /><rect x="13.500" y="13.500" width="7.500" height="7.500" rx="1.500" /></>,
  box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" /><path d="M3 7l9 4 9-4M12 11v10" /></>,
  tag: <><path d="M3 12V3h9l9 9-9 9-9-9z" /><circle cx="7.500" cy="7.500" r="1.500" /></>,
  receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" /><path d="M9 8h6M9 12h6" /></>,
  percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2" /><circle cx="17" cy="17" r="2" /></>,
  sliders: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  inbox: <><path d="M3 13l3-8h12l3 8v6H3v-6z" /><path d="M3 13h5l1 3h6l1-3h5" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />,
  store: <><path d="M4 9l1-5h14l1 5" /><path d="M4 9a3 3 0 0 0 5.300 2 3 3 0 0 0 5.400 0A3 3 0 0 0 20 9" /><path d="M5 13v7h14v-7" /></>,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .9-1 1.700M12 17h.01" /></>,
};

export default function Icon({ name, size = 20, className = '' }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {P[name]}
    </svg>
  );
}
