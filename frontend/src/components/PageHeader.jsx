export default function PageHeader({ title, children }) {
  return (
    <div style={wrapStyle}>
      <div style={titleWrap}>
        <h1 style={titleStyle}>{title}</h1>
        <div style={underline} />
      </div>
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {children}
      </div>
    </div>
  )
}

const wrapStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '1.75rem',
  gap: '1rem',
}

const titleWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
}

const titleStyle = {
  margin: 0,
  fontSize: '1.6rem',
  fontFamily: "'Fraunces', Georgia, serif",
  fontWeight: 700,
  color: '#1A1A14',
  lineHeight: 1.2,
}

const underline = {
  width: 36,
  height: 3,
  background: '#C97A1A',
  borderRadius: 2,
}
