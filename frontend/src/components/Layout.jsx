import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const allNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/cerdos', label: 'Cerdos' },
  { to: '/cochineras', label: 'Cochineras', adminOnly: true },
  { to: '/clientes', label: 'Clientes', adminOnly: true },
  { to: '/empleados', label: 'Empleados', adminOnly: true },
  { to: '/inventario', label: 'Inventario' },
  { to: '/pesajes', label: 'Pesajes' },
  { to: '/ventas', label: 'Ventas' },
  { to: '/veterinario', label: 'Veterinario' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const nav = allNav.filter(item => user?.rol === 'administrador' || !item.adminOnly)

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <div style={{ padding: '1.5rem 1rem', fontWeight: 700, fontSize: '1rem', color: '#fff', borderBottom: '1px solid #374151' }}>
          Granja La Voluntad
        </div>
        <nav style={{ padding: '1rem 0' }}>
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({ ...linkStyle, background: isActive ? '#374151' : 'transparent' })}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            {user?.nombre} ({user?.rol})
          </div>
          <button onClick={handleLogout} style={logoutBtn}>Cerrar sesión</button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  )
}

const sidebarStyle = {
  width: 220,
  background: '#1f2937',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
}

const linkStyle = {
  display: 'block',
  padding: '0.65rem 1.25rem',
  color: '#d1d5db',
  fontSize: '0.9rem',
  transition: 'background 0.15s',
}

const logoutBtn = {
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  padding: '0.45rem 1rem',
  fontSize: '0.85rem',
  width: '100%',
}
