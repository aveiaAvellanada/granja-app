export default function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.3rem', fontSize: '0.875rem' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{error}</span>}
    </div>
  )
}

export const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #d1d5db',
  borderRadius: 6, fontSize: '0.95rem',
}

export const btnPrimary = {
  background: '#2563eb', color: '#fff', border: 'none',
  padding: '0.55rem 1.25rem', borderRadius: 6, fontWeight: 600,
}

export const btnDanger = {
  background: '#ef4444', color: '#fff', border: 'none',
  padding: '0.45rem 1rem', borderRadius: 6, fontSize: '0.85rem',
}

export const card = {
  background: '#fff', borderRadius: 10, padding: '1.5rem',
  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1rem',
}
