import React from 'react';
import { Link } from 'react-router-dom';
import { btnPrimary } from '../components/FormField';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '80vh',
  textAlign: 'center',
  padding: '2rem',
};

export default function NotFound() {
  return (
    <div style={containerStyle}>
      <div style={{ fontSize: '8rem', fontWeight: 900, color: '#e5e7eb', marginBottom: '1rem' }}>404</div>
      <h1 style={{ fontSize: '2rem', color: '#111827', margin: '0 0 1rem' }}>Página no encontrada</h1>
      <p style={{ color: '#6b7280', maxWidth: '400px', marginBottom: '2rem' }}>
        La página que buscas no existe o fue movida a otra dirección.
      </p>
      <Link to="/dashboard" style={{ ...btnPrimary, textDecoration: 'none' }}>
        Volver al Dashboard
      </Link>
    </div>
  );
}
