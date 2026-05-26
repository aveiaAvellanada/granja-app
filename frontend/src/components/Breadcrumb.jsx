import React from 'react';
import { Link } from 'react-router-dom';

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1rem',
  fontSize: '0.85rem',
  color: '#6b7280',
};

const linkStyle = {
  color: '#2563eb',
  textDecoration: 'none',
  fontWeight: 500,
};

export default function Breadcrumb({ items = [] }) {
  return (
    <nav style={navStyle}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span style={{ fontWeight: 600, color: '#374151' }}>{item.label}</span>
            ) : (
              <>
                <Link to={item.path} style={linkStyle}>
                  {item.label}
                </Link>
                <span>&gt;</span>
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
