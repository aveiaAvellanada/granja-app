import { useEffect } from 'react'
import { Icon } from './Icon.jsx'

export default function ConfirmModal({
  isOpen, title, message, onConfirm, onCancel,
  confirmColor = 'green',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar'
}) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.() }
    if (isOpen) {
      window.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const variant = (confirmColor === 'red' || confirmColor === 'danger') ? 'danger' : 'green'

  return (
    <div style={overlay} onClick={onCancel} role="alertdialog" aria-modal="true">
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={iconWrap(variant)}>
          <Icon name={variant === 'danger' ? 'alert' : 'info'} size={20} />
        </div>
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        <div style={actions}>
          <button
            style={btnCancel}
            onClick={onCancel}
            onMouseEnter={e => { e.currentTarget.style.background = '#F7FAF4'; e.currentTarget.style.borderColor = '#B8C4B4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D5DAD0'; }}
          >
            {cancelLabel}
          </button>
          <button
            style={variant === 'danger' ? btnConfirmDanger : btnConfirmGreen}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

const overlay = {
  position: 'fixed', inset: 0,
  background: 'rgba(11, 30, 19, 0.52)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  animation: 'overlayIn 180ms cubic-bezier(0.22,1,0.36,1)',
}

const modal = {
  background: '#FFFFFF',
  borderRadius: 16,
  padding: '1.6rem 1.4rem 1.25rem',
  width: '100%',
  maxWidth: 400,
  boxShadow: '0 28px 60px rgba(0,0,0,0.18)',
  border: '1px solid #E3E8DF',
  textAlign: 'center',
  animation: 'modalIn 220ms cubic-bezier(0.34, 1.56, 0.64, 1)',
}

const iconWrap = (variant) => ({
  width: 52, height: 52,
  borderRadius: 14,
  background: variant === 'danger'
    ? 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)'
    : 'linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%)',
  color: variant === 'danger' ? '#DC2626' : '#166534',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 1rem',
  border: variant === 'danger'
    ? '1px solid rgba(220,38,38,0.18)'
    : '1px solid rgba(22,101,52,0.18)',
})

const titleStyle = {
  margin: '0 0 6px',
  fontSize: '1.05rem',
  fontFamily: "'Lexend', system-ui, sans-serif",
  fontWeight: 700,
  color: '#111827',
  letterSpacing: '-0.01em',
}

const messageStyle = {
  color: '#374151',
  marginBottom: '1.2rem',
  lineHeight: 1.55,
  fontSize: '0.875rem',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const actions = { display: 'flex', gap: 8 }

const btnBase = {
  flex: 1,
  padding: '9px 14px',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: '0.84rem',
  cursor: 'pointer',
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: 'background 100ms ease, border-color 100ms ease',
}

const btnCancel = {
  ...btnBase,
  background: '#FFFFFF',
  color: '#374151',
  border: '1.5px solid #D5DAD0',
}

const btnConfirmGreen = {
  ...btnBase,
  background: '#166534',
  color: '#FFFFFF',
  border: 'none',
}

const btnConfirmDanger = {
  ...btnBase,
  background: '#DC2626',
  color: '#FFFFFF',
  border: 'none',
}
