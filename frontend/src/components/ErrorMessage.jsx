import React from 'react';
import { btnPrimary } from './FormField.jsx';

const containerStyle = {
  padding: '2rem',
  textAlign: 'center',
  background: '#fff',
  borderRadius: '8px',
  border: '1px solid #fee2e2',
  margin: '1rem 0',
};

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ margin: '0 0 0.5rem', color: '#991b1b' }}>Error al cargar los datos</h3>
      <p style={{ color: '#b91c1c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{ ...btnPrimary, padding: '0.5rem 2rem' }}>
          Reintentar
        </button>
      )}
    </div>
  );
}
