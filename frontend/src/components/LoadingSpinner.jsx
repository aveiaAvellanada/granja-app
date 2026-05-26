import React from 'react';

const spinnerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '3rem',
  width: '100%',
};

const circleStyle = (size) => {
  const dimensions = size === 'sm' ? '24px' : size === 'lg' ? '64px' : '40px';
  return {
    width: dimensions,
    height: dimensions,
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };
};

export default function LoadingSpinner({ size = 'md', message = 'Cargando...' }) {
  return (
    <div style={spinnerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={circleStyle(size)}></div>
      {message && <p style={{ marginTop: '1rem', color: '#6b7280', fontWeight: 500 }}>{message}</p>}
    </div>
  );
}
