import React, { useEffect } from 'react'

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmColor = 'blue' }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onCancel() }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={iconWrap(confirmColor)}>
          {confirmColor === 'red' ? '!' : '?'}
        </div>
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        <div style={actionsStyle}>
          <button style={btnCancelStyle} onClick={onCancel}>Cancelar</button>
          <button
            style={confirmColor === 'red' ? btnDangerStyle : btnConfirmStyle}
            onClick={onConfirm}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(26,46,26,0.55)',
  backdropFilter: 'blur(3px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: 'overlayIn 0.18s ease',
}

const modalStyle = {
  background: '#FFFFFF',
  borderRadius: '14px',
  padding: '2rem 1.75rem 1.5rem',
  width: '90%',
  maxWidth: 400,
  boxShadow: '0 28px 70px rgba(26,46,26,0.22)',
  border: '1px solid #EDE8DF',
  textAlign: 'center',
  animation: 'modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
}

const iconWrap = (color) => ({
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: color === 'red' ? '#FEE8E4' : '#EAF3E4',
  color: color === 'red' ? '#B5341F' : '#4A7C35',
  fontSize: '1.4rem',
  fontWeight: 900,
  fontFamily: 'Georgia, serif',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem',
})

const titleStyle = {
  margin: '0 0 0.5rem',
  fontSize: '1.05rem',
  fontFamily: "'Fraunces', Georgia, serif",
  fontWeight: 700,
  color: '#1A1A14',
}

const messageStyle = {
  color: '#5C5845',
  marginBottom: '1.5rem',
  lineHeight: 1.6,
  fontSize: '0.9rem',
}

const actionsStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '0.75rem',
}

const btnCancelStyle = {
  background: '#F4EFE6',
  color: '#5C5845',
  border: '1.5px solid #DDD5C8',
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
}

const btnConfirmStyle = {
  background: '#4A7C35',
  color: '#FFFFFF',
  border: 'none',
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
}

const btnDangerStyle = {
  background: '#B5341F',
  color: '#FFFFFF',
  border: 'none',
  padding: '0.55rem 1.25rem',
  borderRadius: '8px',
  fontWeight: 700,
  fontSize: '0.875rem',
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
}
