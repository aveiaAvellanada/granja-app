export default function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: '1.1rem' }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontWeight: 600,
  marginBottom: '0.35rem',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: '#5C5845',
}

const errorStyle = {
  display: 'block',
  color: '#B5341F',
  fontSize: '0.78rem',
  marginTop: '0.3rem',
  fontWeight: 500,
}

export const inputStyle = {
  width: '100%',
  padding: '0.6rem 0.875rem',
  border: '1.5px solid #DDD5C8',
  borderRadius: '8px',
  fontSize: '0.9rem',
  background: '#FFFFFF',
  color: '#1A1A14',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

export const btnPrimary = {
  background: '#4A7C35',
  color: '#FFFFFF',
  border: 'none',
  padding: '0.6rem 1.4rem',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.875rem',
  letterSpacing: '0.02em',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
  transition: 'background 0.15s',
}

export const btnDanger = {
  background: '#B5341F',
  color: '#FFFFFF',
  border: 'none',
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
  transition: 'background 0.15s',
}

export const btnSecondary = {
  background: '#FFFFFF',
  color: '#5C5845',
  border: '1.5px solid #DDD5C8',
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
  transition: 'background 0.15s, border-color 0.15s',
}

export const card = {
  background: '#FFFFFF',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 2px 10px rgba(26,46,26,0.08), 0 0 0 1px rgba(26,46,26,0.05)',
  border: '1px solid #EDE8DF',
  marginBottom: '1rem',
}
