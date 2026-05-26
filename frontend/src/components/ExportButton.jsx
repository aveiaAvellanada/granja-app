import { useState } from 'react'
import { exportarExcel, exportarCSV } from '../utils/exportar'
import { Icon } from './Icon.jsx'

export default function ExportButton({ data, filename, sheetName = 'Datos' }) {
  const [show, setShow] = useState(false)
  const [hoverItem, setHoverItem] = useState(null)

  return (
    <div style={{ position: 'relative' }}>
      <button
        style={btnStyle}
        onClick={() => setShow(!show)}
        onMouseEnter={e => { e.currentTarget.style.background = '#F7FAF4'; e.currentTarget.style.borderColor = '#B8C4B4'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#D5DAD0'; }}
      >
        <Icon name="download" size={14} />
        Exportar
        <Icon name="chevron-down" size={12} />
      </button>

      {show && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShow(false)} />
          <div style={menu}>
            <button
              style={{ ...item, background: hoverItem === 'xlsx' ? '#F7FAF4' : '#FFFFFF' }}
              onMouseEnter={() => setHoverItem('xlsx')}
              onMouseLeave={() => setHoverItem(null)}
              onClick={() => { exportarExcel(data, filename, sheetName); setShow(false) }}
            >
              <div style={iconBadge('#166534')}>XLSX</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.84rem' }}>Excel</div>
                <div style={{ fontSize: '0.71rem', color: '#6B7280', marginTop: 1 }}>Hoja de cálculo .xlsx</div>
              </div>
            </button>
            <button
              style={{ ...item, background: hoverItem === 'csv' ? '#F7FAF4' : '#FFFFFF' }}
              onMouseEnter={() => setHoverItem('csv')}
              onMouseLeave={() => setHoverItem(null)}
              onClick={() => { exportarCSV(data, filename); setShow(false) }}
            >
              <div style={iconBadge('#B45309')}>CSV</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.84rem' }}>CSV</div>
                <div style={{ fontSize: '0.71rem', color: '#6B7280', marginTop: 1 }}>Texto separado por comas</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const btnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
  background: '#FFFFFF',
  color: '#374151',
  border: '1.5px solid #D5DAD0',
  padding: '7px 12px',
  borderRadius: 8,
  fontSize: '0.83rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: 'background 100ms ease, border-color 100ms ease',
}

const menu = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  background: '#FFFFFF',
  border: '1px solid #E3E8DF',
  borderRadius: 12,
  boxShadow: '0 20px 40px rgba(0,0,0,0.11), 0 4px 10px rgba(0,0,0,0.05)',
  zIndex: 100,
  minWidth: 228,
  overflow: 'hidden',
  padding: 5,
  animation: 'modalIn 160ms cubic-bezier(0.22,1,0.36,1)',
}

const item = {
  padding: '9px 11px',
  cursor: 'pointer',
  border: 'none',
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: 11,
  borderRadius: 8,
  transition: 'background 100ms ease',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const iconBadge = (color) => ({
  width: 32, height: 32,
  borderRadius: 8,
  background: `${color}18`,
  color,
  fontSize: '0.58rem',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  letterSpacing: '0.04em',
  flexShrink: 0,
  border: `1px solid ${color}28`,
  fontFamily: "'Inter', sans-serif",
})
