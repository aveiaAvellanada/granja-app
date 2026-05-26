/* ──────────────────────────────────────────────────────────────
   Icon Set — Inline SVG (Lucide-style, 1.6px stroke)
   Single source of icon glyphs for the entire app.
   Replaces all emoji icons with crisp, consistent vectors.
   ────────────────────────────────────────────────────────────── */

const baseProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function Icon({ name, size = 18, color, style, ...rest }) {
  const props = {
    ...baseProps,
    width: size,
    height: size,
    style: { color: color || 'currentColor', flexShrink: 0, ...style },
    ...rest,
  }
  switch (name) {
    case 'dashboard':
      return (<svg {...props}><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>)
    case 'pig':
      return (<svg {...props}><path d="M5 11c0-3 2.5-5 6-5 1.7 0 3.2.6 4.4 1.6L18 6l-.6 3.4c.4.5.6 1 .6 1.6 0 2.8-3 5-7 5-3.5 0-7-1.5-7-5z"/><circle cx="9" cy="11" r=".6" fill="currentColor"/><path d="M11.5 11.5h1.5M7 18l1-2M14 18l-1-2"/></svg>)
    case 'barn':
      return (<svg {...props}><path d="M3 11l9-7 9 7v10H3V11z"/><path d="M9 21v-6h6v6"/><path d="M3 11h18"/></svg>)
    case 'users':
      return (<svg {...props}><path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M15 3.13a4 4 0 0 1 0 7.75"/></svg>)
    case 'user':
      return (<svg {...props}><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0 1 14 0v1"/></svg>)
    case 'badge':
      return (<svg {...props}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M7 17h10"/></svg>)
    case 'box':
      return (<svg {...props}><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>)
    case 'clipboard':
      return (<svg {...props}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h4"/></svg>)
    case 'receipt':
      return (<svg {...props}><path d="M5 3v18l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5V3l-2 1.5L17 3l-2 1.5L13 3l-2 1.5L9 3 7 4.5 5 3z"/><path d="M8 9h8M8 13h8M8 17h4"/></svg>)
    case 'chart':
      return (<svg {...props}><path d="M3 21V3"/><path d="M3 21h18"/><rect x="7" y="13" width="3" height="5" rx="0.4"/><rect x="12" y="9" width="3" height="9" rx="0.4"/><rect x="17" y="5" width="3" height="13" rx="0.4"/></svg>)
    case 'logout':
      return (<svg {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>)
    case 'plus':
      return (<svg {...props}><path d="M12 5v14M5 12h14"/></svg>)
    case 'minus':
      return (<svg {...props}><path d="M5 12h14"/></svg>)
    case 'check':
      return (<svg {...props}><path d="M5 12l5 5 9-11"/></svg>)
    case 'x':
      return (<svg {...props}><path d="M18 6L6 18M6 6l12 12"/></svg>)
    case 'search':
      return (<svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>)
    case 'filter':
      return (<svg {...props}><path d="M3 5h18l-7 9v6l-4-2v-4L3 5z"/></svg>)
    case 'download':
      return (<svg {...props}><path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>)
    case 'arrow-right':
      return (<svg {...props}><path d="M5 12h14M13 5l7 7-7 7"/></svg>)
    case 'arrow-left':
      return (<svg {...props}><path d="M19 12H5M11 5l-7 7 7 7"/></svg>)
    case 'arrow-up':
      return (<svg {...props}><path d="M5 12l7-7 7 7M12 5v14"/></svg>)
    case 'arrow-down':
      return (<svg {...props}><path d="M12 19V5M5 12l7 7 7-7"/></svg>)
    case 'chevron-down':
      return (<svg {...props}><path d="M6 9l6 6 6-6"/></svg>)
    case 'chevron-right':
      return (<svg {...props}><path d="M9 6l6 6-6 6"/></svg>)
    case 'chevron-left':
      return (<svg {...props}><path d="M15 18l-6-6 6-6"/></svg>)
    case 'transfer':
      return (<svg {...props}><path d="M3 7h13l-3-3M21 17H8l3 3"/></svg>)
    case 'edit':
      return (<svg {...props}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>)
    case 'trash':
      return (<svg {...props}><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>)
    case 'print':
      return (<svg {...props}><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>)
    case 'alert':
      return (<svg {...props}><path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.41 0z"/><path d="M12 9v4M12 17h.01"/></svg>)
    case 'info':
      return (<svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>)
    case 'leaf':
      return (<svg {...props}><path d="M11 20A7 7 0 0 1 4 13c0-5 6-11 17-11 0 7-3 18-10 18z"/><path d="M2 22c7-6 10-9 12-13"/></svg>)
    case 'eye':
      return (<svg {...props}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>)
    case 'lock':
      return (<svg {...props}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>)
    case 'phone':
      return (<svg {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.72 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.35 1.85.59 2.81.72A2 2 0 0 1 22 16.92z"/></svg>)
    case 'mail':
      return (<svg {...props}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>)
    case 'calendar':
      return (<svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>)
    case 'weight':
      return (<svg {...props}><circle cx="12" cy="13" r="8"/><path d="M9 5l3-3 3 3"/><path d="M12 8v5l3-1"/></svg>)
    case 'shield':
      return (<svg {...props}><path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z"/></svg>)
    case 'sparkle':
      return (<svg {...props}><path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM20 14l.7 2.1L23 17l-2.3.9L20 20l-.7-2.1L17 17l2.3-.9L20 14z"/></svg>)
    default:
      return null
  }
}

export default Icon
