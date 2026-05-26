export default function LoadingSpinner({ size = 'md', message = 'Cargando...' }) {
  const dim = size === 'sm' ? 24 : size === 'lg' ? 56 : 40

  return (
    <div style={wrapStyle}>
      <div style={{
        width: dim,
        height: dim,
        border: `3px solid #EDE8DF`,
        borderTop: `3px solid #4A7C35`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && (
        <p style={messageStyle}>{message}</p>
      )}
    </div>
  )
}

const wrapStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
  gap: '0.75rem',
}

const messageStyle = {
  margin: 0,
  color: '#9A9282',
  fontSize: '0.875rem',
  fontWeight: 500,
  fontFamily: "'Cabin', system-ui, sans-serif",
}
