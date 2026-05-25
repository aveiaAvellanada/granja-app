export default function Modal({ title, onClose, children }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', lineHeight: 1, color: '#6b7280' }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
}
const box = {
  background: '#fff', borderRadius: 10, padding: '1.5rem',
  width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
}
