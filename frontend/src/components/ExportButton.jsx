import React, { useState } from 'react'
import { exportarExcel, exportarCSV } from '../utils/exportar'

export default function ExportButton({ data, filename, sheetName = 'Datos' }) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button style={btnStyle} onClick={() => setShow(!show)}>
        ↓ Exportar
      </button>
      {show && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setShow(false)}
          />
          <div style={menuStyle}>
            <button
              style={itemStyle}
              onMouseEnter={e => e.currentTarget.style.background = '#F4EFE6'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              onClick={() => { exportarExcel(data, filename, sheetName); setShow(false) }}
            >
              Excel (.xlsx)
            </button>
            <button
              style={itemStyle}
              onMouseEnter={e => e.currentTarget.style.background = '#F4EFE6'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
              onClick={() => { exportarCSV(data, filename); setShow(false) }}
            >
              CSV (.csv)
            </button>
          </div>
        </>
      )}
    </div>
  )
}

const btnStyle = {
  background: '#FFFFFF',
  color: '#5C5845',
  border: '1.5px solid #DDD5C8',
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Cabin', system-ui, sans-serif",
  transition: 'background 0.15s',
}

const menuStyle = {
  position: 'absolute',
  top: 'calc(100% + 6px)',
  right: 0,
  background: '#FFFFFF',
  border: '1px solid #EDE8DF',
  borderRadius: '10px',
  boxShadow: '0 10px 30px rgba(26,46,26,0.14)',
  zIndex: 100,
  minWidth: 160,
  overflow: 'hidden',
}

const itemStyle = {
  padding: '0.65rem 1rem',
  fontSize: '0.875rem',
  cursor: 'pointer',
  textAlign: 'left',
  background: '#FFFFFF',
  border: 'none',
  width: '100%',
  display: 'block',
  color: '#1A1A14',
  fontFamily: "'Cabin', system-ui, sans-serif",
  fontWeight: 500,
  transition: 'background 0.12s',
}
