import { useEffect } from 'react'
import { Icon } from './Icon.jsx'

export default function Modal({ title, subtitle, onClose, children, maxWidth = 520 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div style={overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div style={{ ...box, maxWidth }} onClick={e => e.stopPropagation()}>
        <div style={header}>
          <div>
            <h2 style={titleStyle}>{title}</h2>
            {subtitle && <p style={subStyle}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={closeBtn}
            aria-label="Cerrar"
            onMouseEnter={e => { e.currentTarget.style.background = '#E3E8DF'; e.currentTarget.style.borderColor = '#D5DAD0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F7FAF4'; e.currentTarget.style.borderColor = '#E3E8DF'; }}
          >
            <Icon name="x" size={15} />
          </button>
        </div>
        <div style={body}>{children}</div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(11, 30, 19, 0.52)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  padding: '1rem',
  animation: 'overlayIn 180ms cubic-bezier(0.22,1,0.36,1)',
}

const box = {
  background: '#FFFFFF',
  borderRadius: 16,
  width: '100%',
  maxHeight: '92vh',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0 28px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
  border: '1px solid #E3E8DF',
  animation: 'modalIn 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
  overflow: 'hidden',
}

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  padding: '1.15rem 1.4rem 0.95rem',
  borderBottom: '1px solid #E3E8DF',
  flexShrink: 0,
}

const titleStyle = {
  margin: 0,
  fontSize: '1.05rem',
  fontFamily: "'Lexend', system-ui, sans-serif",
  fontWeight: 700,
  color: '#111827',
  letterSpacing: '-0.01em',
}

const subStyle = {
  margin: '3px 0 0',
  fontSize: '0.81rem',
  color: '#6B7280',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const closeBtn = {
  background: '#F7FAF4',
  border: '1px solid #E3E8DF',
  borderRadius: 8,
  width: 30,
  height: 30,
  color: '#6B7280',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'background 100ms ease, border-color 100ms ease',
}

const body = {
  padding: '1.2rem 1.4rem 1.4rem',
  overflowY: 'auto',
  flex: 1,
}
