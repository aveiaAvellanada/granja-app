import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { Icon } from './Icon.jsx'

const allNav = [
  { to: '/dashboard',  label: 'Dashboard',  icon: 'dashboard' },
  { to: '/cerdos',     label: 'Cerdos',     icon: 'pig' },
  { to: '/cochineras', label: 'Cochineras', icon: 'barn',      adminOnly: true },
  { to: '/clientes',   label: 'Clientes',   icon: 'users',     adminOnly: true },
  { to: '/empleados',  label: 'Empleados',  icon: 'badge',     adminOnly: true },
  { to: '/inventario', label: 'Inventario', icon: 'box' },
  { to: '/registros',  label: 'Registros',  icon: 'clipboard' },
  { to: '/ventas',     label: 'Ventas',     icon: 'receipt' },
  { to: '/reportes',   label: 'Reportes',   icon: 'chart',     adminOnly: true },
]

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [hover, setHover] = useState(null)

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const nav = allNav.filter(item => user?.rol === 'administrador' || !item.adminOnly)
  const rolLabel = (user?.rol || '').charAt(0).toUpperCase() + (user?.rol || '').slice(1)

  return (
    <div style={shell}>
      {/* ════ SIDEBAR ═══════════════════════════════════════════ */}
      <aside style={sidebar} className="scroll-dark">

        {/* Brand */}
        <div style={brand}>
          <div style={brandMark}>
            <Icon name="leaf" size={15} color="#FDE68A" />
          </div>
          <div className="sidebar-label" style={brandText}>
            <div style={{ fontFamily: "'Lexend', sans-serif", fontSize: '0.88rem', fontWeight: 700, color: '#E6EDE6', letterSpacing: '-0.02em', lineHeight: 1.18 }}>
              La Voluntad de Dios
            </div>
            <div style={{ fontSize: '0.6rem', color: '#577060', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2, fontWeight: 600 }}>
              Granja Porcina
            </div>
          </div>
        </div>

        {/* Section label */}
        <div style={navSection} className="sidebar-label">Módulos</div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 8px', overflowY: 'auto' }}>
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onMouseEnter={() => setHover(to)}
              onMouseLeave={() => setHover(null)}
              style={({ isActive }) => navItem(isActive, hover === to)}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span style={activePip} />}
                  <span style={iconWrap(isActive)}>
                    <Icon name={icon} size={15} />
                  </span>
                  <span className="sidebar-label" style={{ flex: 1, fontSize: '0.83rem', fontFamily: "'Inter', sans-serif" }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={footer}>
          <div
            style={userRow}
            onClick={() => navigate('/perfil')}
            title="Ver perfil"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={avatar}>{initials(user?.nombre)}</div>
            <div className="sidebar-label" style={{ overflow: 'hidden', flex: 1 }}>
              <div style={userName}>{user?.nombre}</div>
              <div style={userRole}>{rolLabel}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={logoutBtn}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.10)'}
          >
            <Icon name="logout" size={14} />
            <span className="sidebar-label">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ════ MAIN ═══════════════════════════════════════════════ */}
      <div style={mainWrap}>
        <header style={topbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={statusPill}>
              <span className="status-dot green pulse-dot" />
              <span style={{ fontSize: '0.77rem', fontWeight: 500, color: '#374151', fontFamily: "'Inter', sans-serif" }}>
                Sistema operativo
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={topUser}
              onClick={() => navigate('/perfil')}
              title="Ver perfil"
              onMouseEnter={e => { e.currentTarget.style.background = '#EDF1EA'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ textAlign: 'right', lineHeight: 1.25 }} className="hide-on-mobile">
                <div style={{ fontSize: '0.84rem', color: '#111827', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{user?.nombre}</div>
                <div style={{ fontSize: '0.7rem', color: '#6B7280', textTransform: 'capitalize', fontFamily: "'Inter', sans-serif" }}>{rolLabel}</div>
              </div>
              <div style={topAvatar}>{initials(user?.nombre)}</div>
            </div>
          </div>
        </header>

        <main style={mainContent}>
          <div className="page-animate">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Styles ──────────────────────────────────────────────────── */

const shell = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: "'Inter', system-ui, sans-serif",
}

const sidebar = {
  width: 'var(--sidebar-w)',
  background: 'linear-gradient(180deg, #0B1E13 0%, #112918 100%)',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  height: '100vh',
  borderRight: '1px solid rgba(255,255,255,0.04)',
  transition: 'width 180ms cubic-bezier(0.22, 1, 0.36, 1)',
}

const brand = {
  padding: '1.1rem 0.875rem',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
}

const brandMark = {
  width: 32,
  height: 32,
  borderRadius: 8,
  background: 'rgba(180, 83, 9, 0.18)',
  border: '1px solid rgba(180, 83, 9, 0.38)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}

const brandText = { overflow: 'hidden' }

const navSection = {
  fontSize: '0.59rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.2em',
  color: '#577060',
  padding: '12px 20px 5px',
  fontFamily: "'Inter', sans-serif",
}

const navItem = (isActive, isHover) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '7px 10px',
  margin: '1px 0',
  borderRadius: 8,
  color: isActive ? '#E6EDE6' : '#8FA897',
  fontWeight: isActive ? 600 : 500,
  background: isActive
    ? 'rgba(22, 101, 52, 0.20)'
    : isHover ? 'rgba(255,255,255,0.04)' : 'transparent',
  border: isActive
    ? '1px solid rgba(22, 101, 52, 0.32)'
    : '1px solid transparent',
  transition: 'all 100ms cubic-bezier(0.22, 1, 0.36, 1)',
  cursor: 'pointer',
  textDecoration: 'none',
  position: 'relative',
})

const activePip = {
  position: 'absolute',
  left: -8,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 3,
  height: 15,
  background: '#FDE68A',
  borderRadius: 2,
}

const iconWrap = (isActive) => ({
  width: 26,
  height: 26,
  borderRadius: 7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: isActive ? 'rgba(22, 101, 52, 0.26)' : 'transparent',
  flexShrink: 0,
  transition: 'background 100ms ease',
})

const footer = {
  padding: '9px 8px 11px',
  borderTop: '1px solid rgba(255,255,255,0.06)',
  flexShrink: 0,
}

const userRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '7px 8px',
  borderRadius: 8,
  cursor: 'pointer',
  marginBottom: 6,
  transition: 'background 100ms ease',
}

const avatar = {
  width: 30,
  height: 30,
  borderRadius: 8,
  background: 'linear-gradient(135deg, #1F4030 0%, #1A3524 100%)',
  border: '1.5px solid rgba(180, 83, 9, 0.42)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#E6EDE6',
  flexShrink: 0,
  fontFamily: "'Lexend', sans-serif",
}

const userName = {
  color: '#E6EDE6',
  fontSize: '0.79rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  fontFamily: "'Lexend', sans-serif",
}

const userRole = {
  color: '#577060',
  fontSize: '0.67rem',
  marginTop: 1,
  fontWeight: 500,
  textTransform: 'capitalize',
  fontFamily: "'Inter', sans-serif",
}

const logoutBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 7,
  width: '100%',
  background: 'rgba(220, 38, 38, 0.10)',
  color: '#FCA5A5',
  border: '1px solid rgba(220, 38, 38, 0.20)',
  borderRadius: 7,
  padding: '7px 10px',
  fontSize: '0.76rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: "'Inter', system-ui, sans-serif",
  transition: 'background 100ms ease',
}

const mainWrap = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  background: '#F2F5EF',
}

const topbar = {
  height: 'var(--topbar-h)',
  background: 'rgba(255,255,255,0.94)',
  backdropFilter: 'saturate(160%) blur(12px)',
  WebkitBackdropFilter: 'saturate(160%) blur(12px)',
  borderBottom: '1px solid #E3E8DF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 1.75rem',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  zIndex: 30,
}

const statusPill = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '5px 11px',
  borderRadius: 999,
  background: '#F7FAF4',
  border: '1px solid #E3E8DF',
}

const topUser = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  cursor: 'pointer',
  padding: '4px 5px 4px 10px',
  borderRadius: 999,
  transition: 'background 100ms ease',
}

const topAvatar = {
  width: 32,
  height: 32,
  borderRadius: 999,
  background: 'linear-gradient(135deg, #166534 0%, #14532D 100%)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.72rem',
  fontWeight: 700,
  border: '2px solid #FFFFFF',
  boxShadow: '0 0 0 1.5px #B45309',
  fontFamily: "'Lexend', sans-serif",
}

const mainContent = {
  flex: 1,
  padding: '1.75rem 2rem 2.5rem',
  overflow: 'auto',
  maxWidth: '100%',
}
