export default function LoadingSpinner({ size = 'md', message = 'Cargando...' }) {
  const dim = size === 'sm' ? 24 : size === 'lg' ? 56 : 40

  return (
    <div style={wrap}>
      <div style={{ position: 'relative', width: dim, height: dim }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2.5px solid #E3E8DF',
          borderTopColor: '#166534',
          borderRightColor: '#166534',
          borderRadius: '50%',
          animation: 'spin 0.75s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 7,
          border: '2px solid transparent',
          borderTopColor: '#B45309',
          borderRadius: '50%',
          animation: 'spin 1.3s linear infinite reverse',
        }} />
      </div>
      {message && <p style={messageStyle}>{message}</p>}
    </div>
  )
}

const wrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3.5rem 2rem',
  gap: '0.875rem',
}

const messageStyle = {
  margin: 0,
  color: '#6B7280',
  fontSize: '0.875rem',
  fontWeight: 500,
  fontFamily: "'Inter', system-ui, sans-serif",
}
