import { btnPrimary } from './FormField.jsx'

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={containerStyle}>
      <div style={iconStyle}>!</div>
      <h3 style={titleStyle}>No se pudieron cargar los datos</h3>
      <p style={messageStyle}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ ...btnPrimary, marginTop: '0.25rem' }}>
          Reintentar
        </button>
      )}
    </div>
  )
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2.5rem',
  textAlign: 'center',
  background: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #F5D0CA',
  boxShadow: '0 2px 10px rgba(181,52,31,0.06)',
  margin: '1rem 0',
}

const iconStyle = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: '#FEE8E4',
  color: '#B5341F',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.4rem',
  fontWeight: 900,
  marginBottom: '0.75rem',
  fontFamily: 'Georgia, serif',
}

const titleStyle = {
  margin: '0 0 0.5rem',
  color: '#1A1A14',
  fontFamily: "'Fraunces', Georgia, serif",
  fontSize: '1.05rem',
  fontWeight: 700,
}

const messageStyle = {
  color: '#9A9282',
  fontSize: '0.875rem',
  marginBottom: '1.25rem',
  maxWidth: 360,
}
