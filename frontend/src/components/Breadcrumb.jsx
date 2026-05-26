import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from './Icon.jsx'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav style={nav} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <span style={sep} aria-hidden="true">
                <Icon name="chevron-right" size={12} />
              </span>
            )}
            {isLast ? (
              <span style={current}>{item.label}</span>
            ) : (
              <Link
                to={item.path}
                style={link}
                onMouseEnter={e => e.currentTarget.style.background = '#E3E8DF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

const nav = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  marginBottom: '1.25rem',
  fontSize: '0.79rem',
  fontWeight: 500,
  fontFamily: "'Inter', system-ui, sans-serif",
}

const link = {
  color: '#166534',
  fontWeight: 600,
  textDecoration: 'none',
  padding: '3px 7px',
  borderRadius: 6,
  transition: 'background 100ms ease',
}

const sep = {
  color: '#9CA3AF',
  display: 'inline-flex',
  alignItems: 'center',
}

const current = {
  fontWeight: 600,
  color: '#374151',
  padding: '3px 7px',
  background: '#F7FAF4',
  borderRadius: 6,
  border: '1px solid #E3E8DF',
}
