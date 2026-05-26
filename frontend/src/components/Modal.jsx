export default function Modal({ title, onClose, children }) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Cerrar">×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(26,46,26,0.55)',
  backdropFilter: 'blur(3px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
  animation: 'overlayIn 0.18s ease',
}

const boxStyle = {
  background: '#FFFFFF',
  borderRadius: '14px',
  padding: '1.75rem',
  width: '100%',
  maxWidth: 500,
  maxHeight: '90vh',
  overflow: 'auto',
  boxShadow: '0 28px 70px rgba(26,46,26,0.22), 0 0 0 1px rgba(26,46,26,0.06)',
  border: '1px solid #EDE8DF',
  animation: 'modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
}

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1.25rem',
  paddingBottom: '0.9rem',
  borderBottom: '1px solid #EDE8DF',
}

const titleStyle = {
  margin: 0,
  fontSize: '1.05rem',
  fontFamily: "'Fraunces', Georgia, serif",
  fontWeight: 700,
  color: '#1A1A14',
}

const closeBtnStyle = {
  background: '#F4EFE6',
  border: 'none',
  borderRadius: '50%',
  width: 32,
  height: 32,
  fontSize: '1.3rem',
  lineHeight: 1,
  color: '#5C5845',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 0.15s',
}
