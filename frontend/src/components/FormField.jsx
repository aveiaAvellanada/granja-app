/* ──────────────────────────────────────────────────────────────
   Design Tokens — "Hacienda Pro"
   Lexend (display) + Inter (body) · Agricultural Enterprise
   ────────────────────────────────────────────────────────────── */

export default function FormField({ label, error, hint, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && <label style={labelStyle}>{label}</label>}
      {children}
      {hint && !error && <span style={hintStyle}>{hint}</span>}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 600,
  marginBottom: '6px',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: '#374151',
}

const hintStyle = {
  display: 'block',
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#6B7280',
  fontSize: '0.76rem',
  marginTop: '5px',
}

const errorStyle = {
  display: 'block',
  fontFamily: "'Inter', system-ui, sans-serif",
  color: '#DC2626',
  fontSize: '0.76rem',
  marginTop: '5px',
  fontWeight: 600,
}

/* ── Input ─────────────────────────────────────────────────── */
export const inputStyle = {
  width: '100%',
  padding: '9px 12px',
  border: '1.5px solid #D5DAD0',
  borderRadius: 8,
  fontSize: '0.875rem',
  background: '#FFFFFF',
  color: '#111827',
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: 'border-color 100ms cubic-bezier(0.22,1,0.36,1), box-shadow 100ms cubic-bezier(0.22,1,0.36,1)',
  boxSizing: 'border-box',
}

/* ── Buttons ────────────────────────────────────────────────── */
const baseBtn = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  padding: '8px 15px',
  borderRadius: 8,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: '0.84rem',
  letterSpacing: '-0.003em',
  cursor: 'pointer',
  border: '1.5px solid transparent',
  transition: 'background 100ms ease, box-shadow 100ms ease, border-color 100ms ease, transform 100ms ease',
  userSelect: 'none',
  whiteSpace: 'nowrap',
}

export const btnPrimary = {
  ...baseBtn,
  background: '#166534',
  color: '#FFFFFF',
}

export const btnDanger = {
  ...baseBtn,
  background: '#DC2626',
  color: '#FFFFFF',
}

export const btnSecondary = {
  ...baseBtn,
  background: '#FFFFFF',
  color: '#374151',
  border: '1.5px solid #D5DAD0',
  fontWeight: 600,
}

export const btnGhost = {
  ...baseBtn,
  background: 'transparent',
  color: '#6B7280',
  fontWeight: 600,
}

export const btnSmall = {
  padding: '5px 10px',
  fontSize: '0.76rem',
  borderRadius: 6,
}

/* ── Cards ──────────────────────────────────────────────────── */
export const card = {
  background: '#FFFFFF',
  borderRadius: 12,
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
  border: '1px solid #E3E8DF',
  marginBottom: '1rem',
}

export const cardTight = {
  ...card,
  padding: '1rem',
}

/* ── Badge function ─────────────────────────────────────────── */
export const badgeStyle = (variant = 'neutral') => {
  const map = {
    neutral: { bg: '#EDF1EA', fg: '#374151', bd: '#D5DAD0' },
    success: { bg: '#DCFCE7', fg: '#14532D', bd: '#BBF7D0' },
    amber:   { bg: '#FEF3C7', fg: '#78350F', bd: '#FDE68A' },
    danger:  { bg: '#FEE2E2', fg: '#991B1B', bd: '#FECACA' },
    info:    { bg: '#EFF6FF', fg: '#1E3A8A', bd: '#BFDBFE' },
  }
  const c = map[variant] || map.neutral
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 9px',
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    background: c.bg,
    color: c.fg,
    border: `1px solid ${c.bd}`,
    whiteSpace: 'nowrap',
    fontFamily: "'Inter', system-ui, sans-serif",
  }
}

/* ── Color tokens ───────────────────────────────────────────── */
export const colors = {
  forest:      '#0B1E13',
  green:       '#166534',
  greenHover:  '#14532D',
  greenSoft:   '#DCFCE7',
  greenAccent: '#16A34A',
  amber:       '#B45309',
  amberSoft:   '#FEF3C7',
  rust:        '#DC2626',
  rustSoft:    '#FEE2E2',
  info:        '#1D4ED8',
  canvas:      '#F2F5EF',
  surface:     '#FFFFFF',
  surface2:    '#F7FAF4',
  border:      '#D5DAD0',
  borderSoft:  '#E3E8DF',
  ink:         '#111827',
  ink2:        '#374151',
  ink3:        '#6B7280',
}
