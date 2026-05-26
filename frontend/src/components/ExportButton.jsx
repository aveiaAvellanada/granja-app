import React, { useState } from 'react';
import { exportarExcel, exportarCSV } from '../utils/exportar';

const btnStyle = {
  background: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  padding: '0.4rem 0.8rem',
  borderRadius: '6px',
  fontSize: '0.85rem',
  fontWeight: 600,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const menuStyle = {
  position: 'absolute',
  top: '100%',
  right: 0,
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  zIndex: 100,
  minWidth: '160px',
  marginTop: '0.25rem',
  overflow: 'hidden'
};

const itemStyle = {
  padding: '0.6rem 1rem',
  fontSize: '0.85rem',
  cursor: 'pointer',
  textAlign: 'left',
  background: 'none',
  border: 'none',
  width: '100%',
  display: 'block',
  transition: 'background 0.15s'
};

export default function ExportButton({ data, filename, sheetName = 'Datos' }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button style={btnStyle} onClick={() => setShow(!show)}>
        📥 Exportar
      </button>
      {show && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} onClick={() => setShow(false)} />
          <div style={menuStyle}>
            <button 
              style={itemStyle} 
              onMouseOver={e => e.target.style.background = '#f9fafb'} 
              onMouseOut={e => e.target.style.background = 'none'}
              onClick={() => { exportarExcel(data, filename, sheetName); setShow(false); }}
            >
              Excel (.xlsx)
            </button>
            <button 
              style={itemStyle}
              onMouseOver={e => e.target.style.background = '#f9fafb'} 
              onMouseOut={e => e.target.style.background = 'none'}
              onClick={() => { exportarCSV(data, filename); setShow(false); }}
            >
              CSV (.csv)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
