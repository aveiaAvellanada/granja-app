import React from 'react'
import { Link } from 'react-router-dom'

export default function Breadcrumb({ items = [] }) {
  return (
    <nav style={navStyle}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <React.Fragment key={index}>
            {index > 0 && <span style={sepStyle}>›</span>}
            {isLast ? (
              <span style={currentStyle}>{item.label}</span>
            ) : (
              <Link to={item.path} style={linkStyle}>
                {item.label}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  marginBottom: '1rem',
  fontSize: '0.8rem',
}

const linkStyle = {
  color: '#4A7C35',
  fontWeight: 600,
  textDecoration: 'none',
  transition: 'color 0.15s',
}

const sepStyle = {
  color: '#9A9282',
  fontSize: '0.9rem',
  userSelect: 'none',
}

const currentStyle = {
  fontWeight: 600,
  color: '#5C5845',
}
