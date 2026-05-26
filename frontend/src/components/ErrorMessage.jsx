import { btnPrimary } from './FormField.jsx'
import { Icon } from './Icon.jsx'

export default function ErrorMessage({ message, onRetry, title = 'No se pudieron cargar los datos' }) {
  return (
    <div style={container}>
      <div style={iconBox}>
        <Icon name="alert" size={24} />
      </div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={messageStyle}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ ...btnPrimary, marginTop: 4 }}>
          <Icon name="arrow-right" size={14} /> Reintentar
        </button>
      )}
    </div>
  )
}

const container = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2.5rem 2rem',
  textAlign: 'center',
  background: '#FFFFFF',
  borderRadius: 12,
  border: '1px solid #FECACA',
  boxShadow: '0 2px 10px rgba(220,38,38,0.05)',
  margin: '1rem 0',
}

const iconBox = {
  width: 52, height: 52,
  borderRadius: 14,
  background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
  color: '#DC2626',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '0.875rem',
  border: '1px solid rgba(220,38,38,0.15)',
}

const titleStyle = {
  margin: '0 0 5px',
  color: '#111827',
  fontFamily: "'Lexend', system-ui, sans-serif",
  fontSize: '1rem',
  fontWeight: 700,
  letterSpacing: '-0.01em',
}

const messageStyle = {
  color: '#6B7280',
  fontSize: '0.875rem',
  marginBottom: '1.25rem',
  maxWidth: 380,
  lineHeight: 1.55,
  fontFamily: "'Inter', system-ui, sans-serif",
}
