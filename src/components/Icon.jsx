const ICONS = {
  home: <path d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5A1.5 1.5 0 0 1 3.5 19z" />,
  grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
  route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5" /></>,
  heart: <path d="M12 20.5s-7.6-4.5-9.3-9.2C1.5 8 3.6 4.5 7.2 4.5c2 0 3.5 1.1 4.8 2.8 1.3-1.7 2.8-2.8 4.8-2.8 3.6 0 5.7 3.5 4.5 6.8-1.7 4.7-9.3 9.2-9.3 9.2z" />,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c.6-3.9 3.7-6.5 7.5-6.5s6.9 2.6 7.5 6.5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.9-3.9" /></>,
  pin: <><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  flame: <path d="M12 21.5c3.9 0 7-2.8 7-6.6 0-3-1.7-5.2-3.5-7.1-.3 1.7-1.3 2.9-2.6 3.4.4-3.5-1.3-6.5-4.2-8.2.2 3.1-1.5 5-3 6.8C4.5 11.9 5 13.5 5 14.9c0 3.8 3.1 6.6 7 6.6z" />,
  star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  sparkle: <path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8z" />,
  chevronRight: <path d="m9 5 7 7-7 7" />,
  chevronLeft: <path d="m15 5-7 7 7 7" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  arrowRight: <path d="M5 12h14m-6-6 6 6-6 6" />,
  lock: <><rect x="5" y="11" width="14" height="9.5" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  logout: <path d="M9 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5h3M16 16.5l4.5-4.5L16 7.5M20.5 12H9.5" />,
  login: <path d="M15 3.5h3A2.5 2.5 0 0 1 20.5 6v12a2.5 2.5 0 0 1-2.5 2.5h-3M10 16.5l4.5-4.5L10 7.5M14.5 12h-11" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  coffee: <><path d="M4.5 9h12v4.5a5.5 5.5 0 0 1-5.5 5.5h-1a5.5 5.5 0 0 1-5.5-5.5z" /><path d="M16.5 10.5h1.2a2.3 2.3 0 0 1 0 4.6h-1.5M8.5 3.5v2.5M12.5 3.5v2.5" /></>,
  utensils: <path d="M6.5 3v7.5a2 2 0 0 0 4 0V3M8.5 3v18M17.5 21V3c-2.2 1.2-3.5 3.7-3.5 7v3.5h3.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  share: <path d="M12 15V3.5M7.5 8 12 3.5 16.5 8M5 13v5.5A2 2 0 0 0 7 20.5h10a2 2 0 0 0 2-2V13" />,
  filter: <path d="M4 6.5h16M7 12h10M10 17.5h4" />,
  ticket: <path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h14a1.5 1.5 0 0 1 1.5 1.5v2a2 2 0 0 0 0 3v2A1.5 1.5 0 0 1 19 17H5a1.5 1.5 0 0 1-1.5-1.5v-2a2 2 0 0 0 0-3zM14 7v10" />,
  map: <><path d="M9 4.5 3.5 6.7v12.8L9 17.3l6 2.2 5.5-2.2V4.5L15 6.7z" /><path d="M9 4.5v12.8M15 6.7v12.8" /></>,
  building: <path d="M4.5 20.5V5A1.5 1.5 0 0 1 6 3.5h8A1.5 1.5 0 0 1 15.5 5v15.5m0-11H18a1.5 1.5 0 0 1 1.5 1.5v9.5M3 20.5h18M8 7.5h4M8 11h4M8 14.5h4" />,
  bookmark: <path d="M6.5 3.5h11V20.5L12 16.5 6.5 20.5z" />,
  bell: <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5zM10 21h4" />,
  trash: <path d="M4.5 6.5h15M9.5 6.5V4.5h5v2M6.5 6.5l.8 12.6A1.5 1.5 0 0 0 8.8 20.5h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12.6M10 10.5v6M14 10.5v6" />,
  shield: <path d="M12 3.5 19 6v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />,
  edit: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />,
  external: <path d="M14 4h6v6M20 4l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />,
}

export default function Icon({ name, size = 20, strokeWidth = 1.8, filled = false, className = '' }) {
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${className}`}>
      {ICONS[name]}
    </svg>
  )
}
