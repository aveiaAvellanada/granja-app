import React, { useEffect } from 'react';

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const modalStyle = {
  background: '#fff',
  borderRadius: '8px',
  padding: '1.5rem',
  width: '90%',
  maxWidth: '400px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const btnCancel = {
  background: '#f3f4f6',
  color: '#374151',
  border: '1px solid #d1d5db',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600
};

const btnConfirmBlue = {
  background: '#2563eb',
  color: '#fff',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600
};

const btnConfirmRed = {
  background: '#dc2626',
  color: '#fff',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600
};

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmColor = 'blue' }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.25rem', color: '#111827' }}>{title}</h3>
        <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.5', fontSize: '0.95rem' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button style={btnCancel} onClick={onCancel}>Cancelar</button>
          <button style={confirmColor === 'red' ? btnConfirmRed : btnConfirmBlue} onClick={onConfirm}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
