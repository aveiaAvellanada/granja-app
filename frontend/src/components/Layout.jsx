import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const allNav = [
  { to: '/dashboard',  label: 'Dashboard'  },
  { to: '/cerdos',     label: 'Cerdos'     },
  { to: '/cochineras', label: 'Cochineras', adminOnly: true },
  { to: '/clientes',   label: 'Clientes',   adminOnly: true },
  { to: '/empleados',  label: 'Empleados',  adminOnly: true },
  { to: '/inventario', label: 'Inventario' },
  { to: '/registros',  label: 'Registros'  },
  { to: '/ventas',     label: 'Ventas'     },
  { to: '/reportes',   label: 'Reportes',  adminOnly: true },
]

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const nav = allNav.filter(item => user?.rol === 'administrador' || !item.adminOnly)

  return (
    <div style={rootStyle}>
      {/* ── Sidebar ── */}
      <aside style={sidebarStyle}>
        {/* Brand */}
        <div style={brandStyle}>
          <span style={brandLeaf}>✦</span>
          <span style={brandName}>La Voluntad</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '0.5rem 0', overflowY: 'auto' }}>
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span style={activeDot} />}
                  <span style={{ marginLeft: isActive ? '0.5rem' : '1.25rem' }}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div style={sidebarFooter}>
          <div
            style={userRowStyle}
            onClick={() => navigate('/perfil')}
            title="Ver perfil"
          >
            <div style={avatarStyle}>{initials(user?.nombre)}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={userNameStyle}>{user?.nombre}</div>
              <div style={userRoleStyle}>{user?.rol}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={logoutBtnStyle}>
            Salir
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={mainWrapStyle}>
        <header style={topbarStyle}>
          <div style={topbarRight}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
              onClick={() => navigate('/perfil')}
            >
              <div style={{ fontSize: '0.875rem', color: '#5C5845', fontWeight: 600 }}>{user?.nombre}</div>
              <div style={topAvatarStyle}>{initials(user?.nombre)}</div>
            </div>
          </div>
        </header>
        <main style={mainContentStyle}>
          <div className="page-animate">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

/* ── Styles ── */

const rootStyle = {
  display: 'flex',
  minHeight: '100vh',
  fontFamily: "'Cabin', system-ui, sans-serif",
}

const sidebarStyle = {
  width: 230,
  background: '#1A2E1A',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  position: 'sticky',
  top: 0,
  height: '100vh',
  overflowY: 'auto',
}

const brandStyle = {
  padding: '1.4rem 1.25rem 1.1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
}

const brandLeaf = {
  color: '#C97A1A',
  fontSize: '1rem',
}

const brandName = {
  fontFamily: "'Fraunces', Georgia, serif",
  fontWeight: 700,
  fontSize: '1.05rem',
  color: '#F4EFE6',
  letterSpacing: '-0.01em',
}

const navLinkStyle = (isActive) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0.65rem 0',
  paddingRight: '1rem',
  color: isActive ? '#F4EFE6' : '#A8B8A8',
  fontSize: '0.875rem',
  fontWeight: isActive ? 700 : 500,
  borderLeft: isActive ? '3px solid #C97A1A' : '3px solid transparent',
  background: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
  transition: 'all 0.15s',
  cursor: 'pointer',
  textDecoration: 'none',
})

const activeDot = {
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#C97A1A',
  flexShrink: 0,
}

const sidebarFooter = {
  padding: '1rem',
  borderTop: '1px solid rgba(255,255,255,0.08)',
  flexShrink: 0,
}

const userRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  marginBottom: '0.75rem',
  cursor: 'pointer',
  padding: '0.35rem',
  borderRadius: 6,
  transition: 'background 0.15s',
}

const avatarStyle = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: '#2C4A2D',
  border: '2px solid #C97A1A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.75rem',
  fontWeight: 700,
  color: '#F4EFE6',
  flexShrink: 0,
}

const userNameStyle = {
  color: '#F4EFE6',
  fontSize: '0.8rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const userRoleStyle = {
  color: '#7A9870',
  fontSize: '0.72rem',
  textTransform: 'capitalize',
  marginTop: 1,
}

const logoutBtnStyle = {
  width: '100%',
  background: 'rgba(181,52,31,0.15)',
  color: '#F4867A',
  border: '1px solid rgba(181,52,31,0.3)',
  borderRadius: 6,
  padding: '0.45rem 0',
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  cursor: 'pointer',
  transition: 'background 0.15s',
}

const mainWrapStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  background: '#F4EFE6',
}

const topbarStyle = {
  height: 56,
  background: '#FFFFFF',
  borderBottom: '1px solid #EDE8DF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: '0 1.75rem',
  flexShrink: 0,
  boxShadow: '0 1px 3px rgba(26,46,26,0.05)',
}

const topbarRight = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
}

const topAvatarStyle = {
  width: 30,
  height: 30,
  borderRadius: '50%',
  background: '#EDE8DF',
  border: '2px solid #C97A1A',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 700,
  color: '#5C5845',
}

const mainContentStyle = {
  flex: 1,
  padding: '2rem 2.25rem',
  overflow: 'auto',
}
