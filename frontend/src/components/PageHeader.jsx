export default function PageHeader({ title, subtitle, children, icon }) {
  return (
    <div style={wrap}>
      <div style={left}>
        {icon && <div style={iconBadge}>{icon}</div>}
        <div>
          <h1 style={titleStyle}>{title}</h1>
          {subtitle && <p style={subStyle}>{subtitle}</p>}
        </div>
      </div>
      {children && <div style={actions}>{children}</div>}
    </div>
  )
}

const wrap = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '1.5rem',
  gap: '1rem',
  flexWrap: 'wrap',
  paddingBottom: '1.25rem',
  borderBottom: '1px solid #E3E8DF',
}

const left = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
}

const iconBadge = {
  width: 42,
  height: 42,
  borderRadius: 11,
  background: 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
  color: '#166534',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid #BBF7D0',
  flexShrink: 0,
}

const titleStyle = {
  margin: 0,
  fontSize: '1.45rem',
  fontFamily: "'Lexend', system-ui, sans-serif",
  fontWeight: 700,
  color: '#111827',
  lineHeight: 1.2,
  letterSpacing: '-0.02em',
}

const subStyle = {
  margin: '3px 0 0',
  color: '#6B7280',
  fontSize: '0.84rem',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const actions = {
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  flexWrap: 'wrap',
}
